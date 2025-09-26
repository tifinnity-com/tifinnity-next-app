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
import {
  Camera,
  PlusCircle,
  Trash2,
  User as UserIcon,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Address {
  id?: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
}

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Address>({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    type: "home",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setFullName(profileData.name || "");
        setPhone(profileData.phone || "");
        setAvatarPreview(profileData.avatar_url || null);
      }

      const { data: addressData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id);
      if (addressData) setAddresses(addressData);

      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    let newAvatarUrl = avatarPreview;

    if (avatarFile) {
      const filePath = `avatars/${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, avatarFile);

      if (uploadError) {
        toast.error("Error uploading avatar.");
        setIsSaving(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);
      newAvatarUrl = publicUrlData.publicUrl;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: fullName, avatar_url: newAvatarUrl },
    });
    const { error: usersUpdateError } = await supabase
      .from("users")
      .update({ name: fullName, phone, avatar_url: newAvatarUrl })
      .eq("id", user.id);

    if (updateError || usersUpdateError) {
      toast.error("Error updating profile.");
    } else {
      toast.success("Profile updated successfully!");
      router.push("/customer/profile");
    }

    setIsSaving(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .insert({ ...addressForm, user_id: user.id })
      .select();

    if (error) {
      toast.error("Error adding address.");
    } else if (data) {
      toast.success("Address added!");
      setAddresses([...addresses, data[0]]);
      setAddressForm({
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        type: "home",
      });
      setShowAddressForm(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      toast.error("Error deleting address");
    } else {
      toast.success("Address has been removed");
      setAddresses(addresses.filter((addr) => addr.id !== addressId));
    }
  };

  if (loading) {
    return <EditProfileSkeleton />;
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Manage your personal information and addresses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-28 h-28">
                  <AvatarImage src={avatarPreview ?? undefined} />
                  <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90"
                >
                  <Camera className="w-5 h-5" />
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Profile Changes"}
            </Button>
          </form>

          <Separator />

          <div>
            <h3 className="text-lg font-medium">Delivery Addresses</h3>
            <div className="space-y-4 mt-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-center justify-between p-3 bg-muted/40 rounded-md"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {addr.type} Address
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.address_line1}, {addr.city}, {addr.state}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAddress(addr.id!)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {!showAddressForm && (
              <Button
                variant="outline"
                onClick={() => setShowAddressForm(true)}
                className="mt-4 w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
              </Button>
            )}

            {showAddressForm && (
              <form
                onSubmit={handleAddAddress}
                className="mt-6 space-y-4 p-4 border rounded-md bg-muted/20"
              >
                <Input
                  placeholder="Address Line 1"
                  value={addressForm.address_line1}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      address_line1: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  placeholder="Address Line 2"
                  value={addressForm.address_line2}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      address_line2: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value,
                      })
                    }
                    required
                  />
                  <Select
                    value={addressForm.type}
                    onValueChange={(value) =>
                      setAddressForm({ ...addressForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Address</Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditProfileSkeleton() {
  return (
    <div className="container max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="w-28 h-28 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <Separator />
          <div>
            <Skeleton className="h-6 w-1/3 mb-4" />
            <div className="space-y-4 mt-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
