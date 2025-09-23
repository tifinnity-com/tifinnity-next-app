"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Mess {
  id: string;
  name: string;
  type?: string;
  services?: string;
  rating?: number;
  image?: string;
}

interface Review {
  id: string;
  mess_id: string;
  user_id: string;
  rating: number;
  comment: string;
  messes: Mess;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messes, setMesses] = useState<Mess[]>([]);
  const [form, setForm] = useState({ mess_id: "", rating: "5", comment: "" });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*, messes(name)")
        .eq("user_id", user?.id);
      setReviews(reviewData ?? []);

      const { data: messData } = await supabase
        .from("messes")
        .select("id, name");
      setMesses(messData ?? []);
    };
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("reviews").insert({
      ...form,
      user_id: user?.id,
      rating: Number(form.rating),
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Thank you for your feedback!");
      setForm({ mess_id: "", rating: "5", comment: "" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">Share Your Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Select
              value={form.mess_id}
              onValueChange={(value) => setForm({ ...form, mess_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Mess" />
              </SelectTrigger>
              <SelectContent>
                {messes.map((mess) => (
                  <SelectItem key={mess.id} value={mess.id}>
                    {mess.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.rating}
              onValueChange={(value) => setForm({ ...form, rating: value })}
            >
              <SelectTrigger className="mt-4">
                <SelectValue placeholder="Select Rating" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} Star{r > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Your Feedback"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="mt-4"
            />
            <Button
              type="submit"
              className="mt-4 bg-orange-500 hover:bg-orange-600 w-full"
            >
              Submit Review
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Mess</th>
                <th className="border p-2">Rating</th>
                <th className="border p-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="border p-2">{review.messes.name}</td>
                  <td className="border p-2">{review.rating} ★</td>
                  <td className="border p-2">{review.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
