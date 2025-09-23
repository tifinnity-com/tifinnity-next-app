"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState("");

  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } else {
        setUser(data.user);
        setFullName(data.user.user_metadata?.full_name || "");
        setAvatarPreview(data.user.user_metadata?.avatar_url || null);
      }
      setLoading(false);
    }
    fetchUser();
  }, [supabase, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setNotification("");
    let newAvatarUrl = user.user_metadata?.avatar_url;

    // 1. Handle avatar upload if a new file is selected
    if (avatarFile) {
      const filePath = `avatars/${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("user-avatars") // Make sure you have a bucket named 'user-avatars'
        .upload(filePath, avatarFile);

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        setNotification("Error uploading avatar. Please try again.");
        setIsSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);

      newAvatarUrl = publicUrlData.publicUrl;
    }

    // 2. Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_url: newAvatarUrl,
      },
    });

    if (updateError) {
      console.error("Profile update error:", updateError);
      setNotification("Error updating profile. Please try again.");
    } else {
      setNotification("Profile updated successfully!");
      // Optionally refresh the user data or redirect
      setTimeout(() => router.push("/profile"), 1500);
    }

    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your name and avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview ?? undefined} />
                  <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-tifinnity-green text-white rounded-full p-2 hover:bg-tifinnity-green/90"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg"
                  className="hidden"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            {notification && (
              <p
                className={`text-sm ${
                  notification.includes("Error")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {notification}
              </p>
            )}
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-tifinnity-green hover:bg-tifinnity-green/90"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
