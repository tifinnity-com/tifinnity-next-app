"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";

interface Subscription {
  id: string;
  mess_id: string;
  subscription_type: string;
  start_date: string;
  end_date: string;
  status: string;
  messes: Mess;
}

interface Mess {
  id: string;
  name: string;
  type?: string;
  services?: string;
  rating?: number;
  image?: string;
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [messes, setMesses] = useState<Mess[]>([]);
  const [form, setForm] = useState({
    mess_id: "",
    subscription_type: "one-day",
  });
  const searchParams = useSearchParams();
  const preselectedMessId = searchParams.get("mess_id");

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*, messes(name)")
        .eq("user_id", user?.id);
      setSubscriptions(subData ?? []);

      const { data: messData } = await supabase
        .from("messes")
        .select("id, name");
      setMesses(messData ?? []);

      if (preselectedMessId) setForm({ ...form, mess_id: preselectedMessId });
    };
    fetchData();

    const channel = supabase
      .channel("subscriptions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        () => {
          fetchData();
          toast("Subscriptions updated!");
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [form, preselectedMessId, supabase]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const startDate = new Date().toISOString().split("T")[0];
    const endDate =
      form.subscription_type === "one-day"
        ? startDate
        : new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0];

    const { error } = await supabase.from("subscriptions").insert({
      user_id: user?.id,
      mess_id: form.mess_id,
      subscription_type: form.subscription_type,
      start_date: startDate,
      end_date: endDate,
      status: "active",
    });
    if (error) toast.error(error.message);
    else toast.success("Subscribed to your tiffin plan!");
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("subscriptions").update({ status }).eq("id", id);
    toast.success(`Subscription ${status}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6 text-orange-600">
        Your Tiffin Plans
      </h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscribe to a Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubscribe}>
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
              value={form.subscription_type}
              onValueChange={(value) =>
                setForm({ ...form, subscription_type: value })
              }
            >
              <SelectTrigger className="mt-4">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-day">One-Day Plan</SelectItem>
                <SelectItem value="weekly">Weekly Plan</SelectItem>
                <SelectItem value="monthly">Monthly Plan</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="mt-4 bg-green-500 hover:bg-green-600 w-full"
            >
              Subscribe
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Mess</th>
                <th className="border p-2">Plan</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="border p-2">{sub.messes.name}</td>
                  <td className="border p-2">{sub.subscription_type}</td>
                  <td className="border p-2">{sub.status}</td>
                  <td className="border p-2">
                    <Button
                      onClick={() =>
                        updateStatus(
                          sub.id,
                          sub.status === "active" ? "skipped" : "active"
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 mr-2"
                    >
                      {sub.status === "active" ? "Skip" : "Activate"}
                    </Button>
                    <Button
                      onClick={() => updateStatus(sub.id, "cancelled")}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
