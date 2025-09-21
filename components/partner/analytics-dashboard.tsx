"use client";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

type Order = {
  total_amount: number;
};

type Subscription = {
  id: string;
};

type Rating = {
  avg_rating: number;
};

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    subscriptions: 0,
    avgRating: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mess } = await supabase
        .from("messes")
        .select("id")
        .eq("vendor_id", user.id)
        .single();

      const messId = mess?.id;
      if (!messId) return;

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("mess_id", messId);

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("mess_id", messId)
        .eq("status", "active");

      const { data: ratings } = await supabase
        .from("mess_ratings")
        .select("avg_rating")
        .eq("mess_id", messId)
        .single();

      setStats({
        orders: orders?.length ?? 0,
        revenue:
          orders?.reduce(
            (sum: number, order: Order) => sum + order.total_amount,
            0
          ) ?? 0,
        subscriptions: subscriptions?.length ?? 0,
        avgRating: ratings?.avg_rating ?? 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="text-lg">Total Orders</h3>
          <p className="text-2xl">{stats.orders}</p>
        </div>
        <div className="p-4 bg-green-100 rounded">
          <h3 className="text-lg">Total Revenue</h3>
          <p className="text-2xl">₹{stats.revenue}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded">
          <h3 className="text-lg">Active Subscriptions</h3>
          <p className="text-2xl">{stats.subscriptions}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded">
          <h3 className="text-lg">Average Rating</h3>
          <p className="text-2xl">{stats.avgRating.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
