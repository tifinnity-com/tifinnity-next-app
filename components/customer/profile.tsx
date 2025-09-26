"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AtSign, Home, Phone } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

interface Address {
  id: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("user", user);

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("name, email, phone")
          .eq("id", user.id)
          .single();

        if (profileError) console.log("Error fetching profile:", profileError);
        else setProfile(profileData as UserProfile);

        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id);

        if (addressError)
          console.error("Error fetching addresses:", addressError);
        else setAddresses(addressData as Address[]);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <div className="text-center py-12">Could not load profile.</div>;
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-3xl font-bold">
                {profile.name}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {profile.email}
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/customer/profile/edit">Edit Profile</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-xl mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <AtSign className="h-5 w-5 text-muted-foreground" />
                  <p>
                    <span className="font-medium">Email:</span> {profile.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-xl mb-4">Delivery Addresses</h3>
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <Card key={addr.id} className="p-4 flex items-start gap-4">
                      <Home className="h-6 w-6 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-bold capitalize text-md">
                          {addr.type} Address
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {addr.address_line1}
                        </p>
                        {addr.address_line2 && (
                          <p className="text-muted-foreground text-sm">
                            {addr.address_line2}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No addresses found. Please add one.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 text-center sm:text-left">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            <div>
              <Skeleton className="h-6 w-1/3 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
            <Separator />
            <div>
              <Skeleton className="h-6 w-1/3 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
