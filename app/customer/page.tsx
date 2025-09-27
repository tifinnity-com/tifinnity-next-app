import { createClient } from "@/utils/supabase/client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Subscription {
  id: string;
  subscription_type: string;
  messes:
    | {
        name: string | null;
      }[]
    | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  messes: { name: string | null }[];
}

export default async function CustomerDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscriptions } = await supabase
    .from("subcriptions")
    .select("id, subscription_type, messes(name)")
    .eq("user_id", user?.id)
    .eq("status", "active");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount, messes(name)")
    .eq("user_id", user?.id)
    .limit(3);

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Your Tifinnity, {user?.user_metadata.full_name || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s a quick overview of your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Meal Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions?.length ? (
                <ul className="space-y-4">
                  {subscriptions?.map((sub: Subscription) => (
                    <li
                      key={sub.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          {sub.messes?.length
                            ? sub.messes.map((mess, i) => (
                                <span key={i}>
                                  {mess.name || "Unnamed Mess"}
                                </span>
                              ))
                            : "No mess info"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sub.subscription_type} Plan
                        </p>
                      </div>
                      <Button asChild variant="outline">
                        <Link href="/customer/subscriptions">View</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p>No active plans.</p>
                  <Button asChild className="mt-4">
                    <Link href="/customer/messes">Find a mess!</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders?.length ? (
              <ul className="space-y-4">
                {orders.map((order: Order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {order.messes?.length
                          ? order.messes.map(
                              (mess: { name: string | null }, i: number) => (
                                <span key={i}>
                                  {mess.name || "Unnamed Mess"}
                                </span>
                              )
                            )
                          : "Unknown Mess"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{order.total_amount} ({order.status})
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link href="/customer/orders">Details</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p>No recent orders.</p>
                <Button asChild className="mt-4">
                  <Link href="/customer/messes">Order now!</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button asChild variant="outline">
            <Link href="/customer/messes">Find a Mess</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/customer/subscriptions">My Subscriptions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/customer/orders">Order History</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/customer/profile">My Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
