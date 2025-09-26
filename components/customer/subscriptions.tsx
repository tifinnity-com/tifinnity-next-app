"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Mess {
  name: string;
  image: string;
}

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  subscription_type: string;
  messes: Mess | null;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("subscriptions")
          .select(
            "id, start_date, end_date, status, subscription_type, messes(name, image)"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching subscriptions:", error);
          toast.error("Could not fetch subscriptions.");
        } else {
          const formattedData: Subscription[] = (data || []).map((item) => ({
            ...item,
            messes: Array.isArray(item.messes)
              ? item.messes.length > 0
                ? item.messes[0]
                : null
              : item.messes,
          }));
          setSubscriptions(formattedData);
        }
      }
      setLoading(false);
    };

    fetchSubscriptions();
  }, [supabase]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update subscription.");
    } else {
      toast.success(`Subscription has been ${newStatus}.`);
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === id ? { ...sub, status: newStatus } : sub
        )
      );
    }
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "skipped":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <SubscriptionSkeleton />;
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Tiffin Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscriptions and preferences.
          </p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link href="/customer/messes">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Subscription
          </Link>
        </Button>
      </div>

      {subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{sub.messes?.name || "Unknown Mess"}</CardTitle>
                <CardDescription>Plan: {sub.subscription_type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Start Date:</span>
                  <span>{new Date(sub.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>End Date:</span>
                  <span>{new Date(sub.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={getStatusVariant(sub.status)}>
                    {sub.status}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {sub.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(sub.id, "skipped")}
                  >
                    Skip
                  </Button>
                )}
                {sub.status === "skipped" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(sub.id, "active")}
                  >
                    Resume
                  </Button>
                )}
                {sub.status !== "cancelled" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStatusUpdate(sub.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-12 border-dashed">
          <List className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold">No Subscriptions Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You have no active or past tiffin subscriptions.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/customer/messes">Find a Mess to Subscribe</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function SubscriptionSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
