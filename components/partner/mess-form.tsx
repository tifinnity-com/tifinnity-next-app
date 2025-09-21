"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type Mess = {
  id?: number;
  name: string;
  type: "veg" | "non-veg" | "hybrid";
  services: string;
  image: File | string | null;
  vendor_id?: string;
};

export default function MessForm() {
  const [mess, setMess] = useState<Mess>({
    name: "",
    type: "veg",
    services: "",
    image: null,
  });
  const [messId, setMessId] = useState<number | null>(null);

  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchMess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("messes")
        .select("*")
        .eq("vendor_id", user.id)
        .single();

      if (data) {
        setMess({ ...data, image: null }); // image is not fetched from DB
        setMessId(data.id);
      }
    };

    fetchMess();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let imageUrl: string | null = null;

    if (mess.image instanceof File) {
      const { data: imageData, error: uploadError } = await supabase.storage
        .from("mess-images")
        .upload(`mess-${messId || Date.now()}.jpg`, mess.image);

      if (uploadError || !imageData?.path) {
        alert("Image upload failed");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("mess-images")
        .getPublicUrl(imageData.path);

      imageUrl = publicUrlData?.publicUrl ?? null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not found");
      return;
    }

    const payload: Omit<Mess, "image"> & { image?: string } = {
      name: mess.name,
      type: mess.type,
      services: mess.services,
      vendor_id: user.id,
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    if (messId) {
      await supabase.from("messes").update(payload).eq("id", messId);
    } else {
      const { data: inserted } = await supabase
        .from("messes")
        .insert(payload)
        .select()
        .single();
      if (inserted) setMessId(inserted.id);
    }

    alert("Mess saved!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-lg">
      <h2 className="text-2xl mb-4">Manage Mess</h2>
      <input
        type="text"
        placeholder="Mess Name"
        value={mess.name}
        onChange={(e) => setMess({ ...mess, name: e.target.value })}
        className="mb-4 p-2 border rounded w-full"
        required
      />
      <select
        value={mess.type}
        onChange={(e) =>
          setMess({ ...mess, type: e.target.value as Mess["type"] })
        }
        className="mb-4 p-2 border rounded w-full"
      >
        <option value="veg">Veg</option>
        <option value="non-veg">Non-Veg</option>
        <option value="hybrid">Hybrid</option>
      </select>
      <textarea
        placeholder="Services"
        value={mess.services}
        onChange={(e) => setMess({ ...mess, services: e.target.value })}
        className="mb-4 p-2 border rounded w-full"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setMess({ ...mess, image: file });
        }}
        className="mb-4"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Save Mess
      </button>
    </form>
  );
}
