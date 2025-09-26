"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare, MessagesSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface User {
  name: string;
  avatar_url?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: User | null;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: mess } = await supabase
        .from("messes")
        .select("id")
        .eq("vendor_id", user.id)
        .single();
      if (!mess?.id) return setLoading(false);

      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, users(name, avatar_url)")
        .eq("mess_id", mess.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch reviews.");
        console.error("Error fetching reviews:", error);
      } else {
        const parsed = (data ?? []).map(
          (r): Review => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            users: Array.isArray(r.users)
              ? r.users[0] ?? null
              : r.users ?? null,
          })
        );
        setReviews(parsed);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [supabase]);

  const filteredReviews = useMemo(() => {
    if (filter === "all") return reviews;
    const rating = parseInt(filter);
    return reviews.filter((review) => review.rating === rating);
  }, [reviews, filter]);

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            Read and respond to feedback from your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="5">5 Stars</TabsTrigger>
              <TabsTrigger value="4">4 Stars</TabsTrigger>
              <TabsTrigger value="3">3 Stars</TabsTrigger>
              <TabsTrigger value="2">2 Stars</TabsTrigger>
              <TabsTrigger value="1">1 Star</TabsTrigger>
            </TabsList>
          </Tabs>
          {loading ? (
            <ReviewSkeleton />
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 border-dashed border-2 rounded-lg">
              <MessagesSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold">No Reviews Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no reviews with the filter: {filter} stars
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.users?.avatar_url ?? ""} />
                      <AvatarFallback>
                        {review.users?.name?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">
                          {review.users?.name ?? "Anonymous"}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" /> Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Reply to {review.users?.name ?? "Customer"}
                          </DialogTitle>
                        </DialogHeader>
                        <Textarea placeholder="Write your response..." />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                          </DialogClose>
                          <Button>Send Reply</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
