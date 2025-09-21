"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type Subscription = {
  id: string;
  subscription_type: string;
  start_date: string;
  end_date: string;
  status: "active" | "skipped" | "cancelled";
  mess_id: string;
  users: {
    name: string;
  } | null;
};

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchSubscriptions = async () => {
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

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*, users(name)")
        .eq("mess_id", mess.id);

      if (subData) setSubscriptions(subData as Subscription[]);
    };

    fetchSubscriptions();

    const channel = supabase
      .channel("subscriptions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        () => {
          fetchSubscriptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const updateStatus = async (id: string, status: Subscription["status"]) => {
    await supabase.from("subscriptions").update({ status }).eq("id", id);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Subscription Management</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Start Date</th>
            <th className="border p-2">End Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id}>
              <td className="border p-2">{sub.users?.name ?? "—"}</td>
              <td className="border p-2">{sub.subscription_type}</td>
              <td className="border p-2">{sub.start_date}</td>
              <td className="border p-2">{sub.end_date}</td>
              <td className="border p-2">{sub.status}</td>
              <td className="border p-2">
                <select
                  onChange={(e) =>
                    updateStatus(
                      sub.id,
                      e.target.value as Subscription["status"]
                    )
                  }
                  value={sub.status}
                  className="p-1 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="skipped">Skipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
