"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type Payment = {
  id: string;
  amount: number;
  platform_fee: number;
  payment_status: string;
  payment_date: string;
  mess_id: string;
  users: {
    name: string;
  } | null;
};

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchPayments = async () => {
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

      const { data: paymentData } = await supabase
        .from("payments")
        .select("*, users(name)")
        .eq("mess_id", mess.id);

      if (paymentData) setPayments(paymentData as Payment[]);
    };

    fetchPayments();
  }, [supabase]);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Payment Tracking</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Platform Fee</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="border p-2">{payment.users?.name ?? "—"}</td>
              <td className="border p-2">{payment.amount}</td>
              <td className="border p-2">{payment.platform_fee}</td>
              <td className="border p-2">{payment.payment_status}</td>
              <td className="border p-2">{payment.payment_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
