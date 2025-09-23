import { createClient } from "@/utils/supabase/client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CustomerDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscriptions } = await supabase
    .from("subcriptions")
    .select("id , subscription_type, messes(name)")
    .eq("user_id", user?.id)
    .eq("status", "active");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount, messes(nam)")
    .eq("user_id", user?.id)
    .limit(3);

  return (
    <div className="container mx-auto p-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Welcome to Your Tifinnity, {user?.user_metadata.full_name || "User"}!
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Meal Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions?.length ? (
              subscriptions.map((sub) => (
                <p key={sub.id}>
                  {sub.messes && sub.messes.length > 0
                    ? sub.messes[0].name
                    : "Unknown Mess"}{" "}
                  - {sub.subscription_type} Plan
                </p>
              ))
            ) : (
              <p>
                No active plans.{" "}
                <a
                  href="/customer/messes"
                  className="text-orange-500 underline"
                >
                  Find a mess!
                </a>
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders?.length ? (
              orders.map((order) => (
                <p key={order.id}>
                  {order.messes && order.messes.length > 0
                    ? order.messes[0].nam
                    : "Unknown Mess"}{" "}
                  - ₹{order.total_amount} ({order.status})
                </p>
              ))
            ) : (
              <p>
                No recent orders.{" "}
                <a
                  href="/customer/messes"
                  className="text-orange-500 underline"
                >
                  Order now!
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
