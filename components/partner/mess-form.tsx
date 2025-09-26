"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Utensils } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Mess = {
  id?: string;
  name: string;
  type: "veg" | "non-veg" | "hybrid";
  services: string;
  image: string | null;
  vendor_id?: string;
};

type MessFormState = Omit<Mess, "image"> & {
  imageFile: File | null;
  imageUrl: string | null;
};

export default function ManageMessPage() {
  const [mess, setMess] = useState<Mess | null>(null);
  const [formState, setFormState] = useState<MessFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchMess = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("messes")
          .select("*")
          .eq("vendor_id", user.id)
          .single();
        if (data) {
          setMess(data);
          setFormState({ ...data, imageFile: null, imageUrl: data.image });
        } else {
          setFormState({
            name: "",
            type: "veg",
            services: "",
            imageFile: null,
            imageUrl: null,
          });
        }
      }
      setIsLoading(false);
    };

    fetchMess();
  }, [supabase]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && formState) {
      setFormState({ ...formState, imageFile: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formState) return;

    setIsSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    if (!user) {
      toast.error("You must be logged in.");
      setIsSaving(false);
      return;
    }

    let publicImageUrl = formState.imageUrl;

    if (formState.imageFile) {
      const filePath = `public/mess-${user.id}-${Date.now()}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from("mess-images")
        .upload(filePath, formState.imageFile, { upsert: true });
      console.log("upload data", data);
      console.log("upload error", uploadError);

      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message);
        setIsSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("mess-images")
        .getPublicUrl(filePath);
      publicImageUrl = urlData?.publicUrl ?? null;
    }

    const payload = {
      name: formState.name,
      type: formState.type,
      services: formState.services,
      vendor_id: user.id,
      image: publicImageUrl,
    };

    const promiseFn = async () => {
      return mess?.id
        ? await supabase
            .from("messes")
            .update(payload)
            .eq("id", mess.id)
            .select()
            .single()
        : await supabase.from("messes").insert(payload).select().single();
    };

    toast.promise(promiseFn(), {
      loading: "Saving mess details...",
      success: (res) => {
        if (res.data) {
          setMess(res.data);
          setFormState({
            ...res.data,
            imageFile: null,
            imageUrl: res.data.image,
          });
          setPreviewUrl(null);
        }
        return `Mess ${mess?.id ? "updated" : "created"} successfully!`;
      },
      error: `Failed to ${mess?.id ? "update" : "create"} mess.`,
    });

    setIsSaving(false);
  };

  if (isLoading) {
    return <MessFormSkeleton />;
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>
              {mess?.id ? "Edit Your Mess" : "Create Your Mess"}
            </CardTitle>
            <CardDescription>
              Manage your mess profile details that customers will see.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Mess Name</Label>
              <Input
                id="name"
                placeholder="e.g., Mom's Kitchen"
                value={formState?.name || ""}
                onChange={(e) =>
                  formState &&
                  setFormState({ ...formState, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mess Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                  {previewUrl || formState?.imageUrl ? (
                    <Image
                      src={previewUrl || formState?.imageUrl || ""}
                      alt="Mess preview"
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Mess Type</Label>
                <Select
                  value={formState?.type || "veg"}
                  onValueChange={(value) =>
                    formState &&
                    setFormState({ ...formState, type: value as Mess["type"] })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">
                      <div className="flex items-center">
                        <Utensils className="mr-2 h-4 w-4" /> Veg
                      </div>
                    </SelectItem>
                    <SelectItem value="non-veg">
                      <div className="flex items-center">
                        <Utensils className="mr-2 h-4 w-4" /> Non-Veg
                      </div>
                    </SelectItem>
                    <SelectItem value="hybrid">
                      <div className="flex items-center">
                        <Utensils className="mr-2 h-4 w-4" /> Hybrid
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services (comma-separated)</Label>
              <Textarea
                id="services"
                placeholder="e.g., Delivery, Dining, Takeaway"
                value={formState?.services || ""}
                onChange={(e) =>
                  formState &&
                  setFormState({ ...formState, services: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function MessFormSkeleton() {
  return (
    <div className="container max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-32 h-32 rounded-lg" />
              <Skeleton className="h-10 w-full max-w-xs" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}
