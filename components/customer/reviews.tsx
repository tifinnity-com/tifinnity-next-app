"use client";
import { useState, useEffect, FormEvent } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface Mess {
  id: string;
  name: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  messes: Mess | null;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscribedMesses, setSubscribedMesses] = useState<Mess[]>([]);
  const [form, setForm] = useState({ mess_id: "", rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, messes(id, name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reviewError) {
        console.error("Error fetching reviews:", reviewError);
      } else {
        setReviews(
          (reviewData ?? []).map(
            (r): Review => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at,
              messes: Array.isArray(r.messes)
                ? r.messes[0] ?? null
                : r.messes ?? null,
            })
          )
        );
      }

      const { data: subsData, error: subsError } = await supabase
        .from("subscriptions")
        .select("messes(id, name)")
        .eq("user_id", user.id)
        .in("status", ["active", "completed"]);

      if (subsError) {
        console.error("Error fetching subscriptions:", subsError);
      } else {
        const messMap = new Map<string, Mess>();
        (subsData ?? []).forEach((s) => {
          const messArray = (s as { messes: Mess[] | Mess | null }).messes;
          const mess = Array.isArray(messArray)
            ? messArray[0] ?? null
            : messArray;
          if (mess) messMap.set(mess.id, mess);
        });
        setSubscribedMesses(Array.from(messMap.values()));
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !form.mess_id) {
      toast.error("Please select a mess to review.");
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        mess_id: form.mess_id,
        rating: form.rating,
        comment: form.comment,
      })
      .select("*, messes(id, name)")
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Thank you for your feedback!");
      setReviews([data as Review, ...reviews]);
      setForm({ mess_id: "", rating: 5, comment: "" });
    }
  };

  if (loading) return <ReviewsSkeleton />;

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Tabs defaultValue="my-reviews">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="write-review">Write a Review</TabsTrigger>
        </TabsList>

        <TabsContent value="my-reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Past Reviews</CardTitle>
              <CardDescription>
                Here is the feedback you have shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">
                          {review.messes?.name ?? "Unknown Mess"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
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
                    <p className="text-muted-foreground mt-3">
                      {review.comment}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 border-dashed border-2 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-xl font-semibold">No Reviews Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You have not submitted any reviews yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="write-review" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Feedback</CardTitle>
              <CardDescription>
                Let us know about your experience with a tiffin service.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Select
                  value={form.mess_id}
                  onValueChange={(value) =>
                    setForm({ ...form, mess_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Mess to Review" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscribedMesses.map((mess) => (
                      <SelectItem key={mess.id} value={mess.id}>
                        {mess.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label>Your Rating</Label>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          i < form.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground/30 hover:text-yellow-300"
                        }`}
                        onClick={() => setForm({ ...form, rating: i + 1 })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Your Comments</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your thoughts..."
                    value={form.comment}
                    onChange={(e) =>
                      setForm({ ...form, comment: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Pencil className="mr-2 h-4 w-4" /> Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Tabs defaultValue="my-reviews">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="write-review">Write a Review</TabsTrigger>
        </TabsList>
        <TabsContent value="my-reviews" className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
