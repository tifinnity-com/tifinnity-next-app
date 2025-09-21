"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  mess_id: string;
  users: {
    name: string;
  } | null;
};

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchReviews = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mess } = await supabase
        .from("messes")
        .select("id")
        .eq("vendor_id", user.id)
        .single();

      if (!mess?.id) return;

      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*, users(name)")
        .eq("mess_id", mess.id);

      if (reviewData) setReviews(reviewData as Review[]);
    };

    fetchReviews();
  }, [supabase]);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Reviews</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Rating</th>
            <th className="border p-2">Comment</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td className="border p-2">{review.users?.name ?? "—"}</td>
              <td className="border p-2">{review.rating}</td>
              <td className="border p-2">{review.comment}</td>
              <td className="border p-2">{review.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
