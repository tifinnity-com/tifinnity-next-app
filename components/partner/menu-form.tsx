"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type MenuItem = {
  id: string;
  item_name: string;
  price: number;
  menu_date: string;
  available: boolean;
  mess_id: string;
};

type FormState = {
  item_name: string;
  price: string;
  menu_date: string;
  available: boolean;
};

export default function MenuManagement() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormState>({
    item_name: "",
    price: "",
    menu_date: "",
    available: true,
  });

  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchMenus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mess } = await supabase
        .from("messes")
        .select("id")
        .eq("vendor_id", user.id)
        .single();

      if (!mess?.id) return;

      const { data: menuData } = await supabase
        .from("mess_menus")
        .select("*")
        .eq("mess_id", mess.id);

      if (menuData) setMenus(menuData as MenuItem[]);
    };

    fetchMenus();

    const channel = supabase
      .channel("menus")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mess_menus" },
        () => {
          fetchMenus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: mess } = await supabase
      .from("messes")
      .select("id")
      .eq("vendor_id", user.id)
      .single();

    if (!mess?.id) return;

    await supabase.from("mess_menus").insert({
      item_name: form.item_name,
      price: Number(form.price),
      menu_date: form.menu_date,
      available: form.available,
      mess_id: mess.id,
    });

    setForm({ item_name: "", price: "", menu_date: "", available: true });
  };

  const toggleAvailability = async (id: string, available: boolean) => {
    await supabase.from("mess_menus").update({ available }).eq("id", id);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Menu Management</h2>
      <form onSubmit={handleSubmit} className="mb-6 max-w-lg">
        <input
          type="text"
          placeholder="Item Name"
          value={form.item_name}
          onChange={(e) => setForm({ ...form, item_name: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <input
          type="date"
          value={form.menu_date}
          onChange={(e) => setForm({ ...form, menu_date: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Add Item
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Item</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Available</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => (
            <tr key={menu.id}>
              <td className="border p-2">{menu.item_name}</td>
              <td className="border p-2">{menu.price}</td>
              <td className="border p-2">{menu.menu_date}</td>
              <td className="border p-2">{menu.available ? "Yes" : "No"}</td>
              <td className="border p-2">
                <button
                  onClick={() => toggleAvailability(menu.id, !menu.available)}
                  className="bg-yellow-500 text-white p-1 rounded"
                >
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
