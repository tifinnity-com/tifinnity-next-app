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
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  name: string;
  email: string;
  avatar_url: string;
}

export default function PartnerProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError)
          console.error("Error fetching profile:", profileError);
        else setProfile(profileData as UserProfile);
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
    <div className="container max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
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
              <Link href="/partner/dashboard/settings">Edit Profile</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            This is your partner profile page. You can edit your details in the
            settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-5 w-64 mx-auto sm:mx-0" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Skeleton className="h-5 w-3/4 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
