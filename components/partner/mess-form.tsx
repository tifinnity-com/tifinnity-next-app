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
import { Badge } from "@/components/ui/badge";
import { Utensils, Edit, Camera, X } from "lucide-react";
import Image from "next/image";

type Mess = {
  id?: string;
  name: string;
  type: "veg" | "non-veg" | "hybrid";
  services: string;
  image: string | null; // URL from Supabase Storage
  vendor_id?: string;
};

// Define the type for the form state, which can hold a File
type MessFormState = Omit<Mess, "image"> & {
  imageFile: File | null;
  imageUrl: string | null;
};

export default function ManageMessPage() {
  const [mess, setMess] = useState<Mess | null>(null);
  const [formState, setFormState] = useState<MessFormState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          // Initialize form state when data is fetched
          setFormState({
            ...data,
            imageFile: null,
            imageUrl: data.image,
          });
        } else {
          // No mess found, start in editing mode to create one
          setIsEditing(true);
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to save a mess.");
      return;
    }

    let publicImageUrl = formState.imageUrl;

    // Upload image if a new one is selected
    if (formState.imageFile) {
      const filePath = `public/mess-${user.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("mess-images")
        .upload(filePath, formState.imageFile, {
          upsert: true, // Overwrite if file exists (useful for updates)
        });

      if (uploadError) {
        alert("Image upload failed: " + uploadError.message);
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

    if (mess?.id) {
      // Update existing mess
      const { data, error } = await supabase
        .from("messes")
        .update(payload)
        .eq("id", mess.id)
        .select()
        .single();
      if (data) setMess(data);
      if (error) alert("Failed to update mess.");
    } else {
      // Insert new mess
      const { data, error } = await supabase
        .from("messes")
        .insert(payload)
        .select()
        .single();
      if (data) setMess(data);
      if (error) alert("Failed to create mess.");
    }

    setIsEditing(false);
    setPreviewUrl(null);
    alert("Mess details saved successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl(null);
    if (mess) {
      setFormState({ ...mess, imageFile: null, imageUrl: mess.image });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading your mess details...</div>;
  }

  // --- RENDER LOGIC ---

  if (!isEditing && mess) {
    // --- PROFILE VIEW ---
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-bold text-gray-800">
              <Utensils className="text-blue-500" />
              {mess.name}
            </CardTitle>
            <CardDescription>Your mess profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mess.image && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={mess.image}
                  alt={mess.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">Mess Type</p>
                <Badge variant="outline" className="capitalize">
                  {mess.type}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">Services Offered</p>
                <p className="text-gray-800">
                  {mess.services || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              {mess?.id ? "Edit Your Mess" : "Create Your Mess"}
            </CardTitle>
            <CardDescription>
              Provide the details below to set up your mess profile.
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
                <div className="relative w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border">
                  {previewUrl || formState?.imageUrl ? (
                    <Image
                      src={previewUrl || formState?.imageUrl || ""}
                      alt="Mess preview"
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="veg">Veg</SelectItem>
                    <SelectItem value="non-veg">Non-Veg</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
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
          <CardFooter className="flex justify-end gap-2">
            {mess?.id && (
              <Button variant="outline" type="button" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
