"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type Order = {
  id: string;
  total_amount: number;
  status: "placed" | "delivered" | "cancelled";
  mess_id: string;
  mess_menus: {
    item_name: string;
  } | null;
  users: {
    name: string;
  } | null;
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
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

      const { data: orderData } = await supabase
        .from("orders")
        .select("*, mess_menus(item_name), users(name)")
        .eq("mess_id", mess.id);

      if (orderData) setOrders(orderData as Order[]);
    };

    fetchOrders();

    const channel = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    await supabase.from("orders").update({ status }).eq("id", id);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Order Management</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border p-2">{order.users?.name ?? "—"}</td>
              <td className="border p-2">
                {order.mess_menus?.item_name ?? "—"}
              </td>
              <td className="border p-2">{order.total_amount}</td>
              <td className="border p-2">{order.status}</td>
              <td className="border p-2">
                <select
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value as Order["status"])
                  }
                  value={order.status}
                  className="p-1 border rounded"
                >
                  <option value="placed">Placed</option>
                  <option value="delivered">Delivered</option>
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
