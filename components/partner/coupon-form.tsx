"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type Coupon = {
  id: string;
  code: string;
  discount_type: "flat" | "percent";
  value: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
};

type FormState = {
  code: string;
  discount_type: "flat" | "percent";
  value: string;
  valid_from: string;
  valid_until: string;
  usage_limit: string;
};

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<FormState>({
    code: "",
    discount_type: "flat",
    value: "",
    valid_from: "",
    valid_until: "",
    usage_limit: "",
  });

  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchCoupons = async () => {
      const { data } = await supabase.from("coupons").select("*");
      if (data) setCoupons(data as Coupon[]);
    };
    fetchCoupons();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      code: form.code,
      discount_type: form.discount_type,
      value: Number(form.value),
      valid_from: form.valid_from,
      valid_until: form.valid_until,
      usage_limit: Number(form.usage_limit),
    };

    await supabase.from("coupons").insert(payload);

    setForm({
      code: "",
      discount_type: "flat",
      value: "",
      valid_from: "",
      valid_until: "",
      usage_limit: "",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Coupon Management</h2>
      <form onSubmit={handleSubmit} className="mb-6 max-w-lg">
        <input
          type="text"
          placeholder="Coupon Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <select
          value={form.discount_type}
          onChange={(e) =>
            setForm({
              ...form,
              discount_type: e.target.value as FormState["discount_type"],
            })
          }
          className="mb-4 p-2 border rounded w-full"
        >
          <option value="flat">Flat</option>
          <option value="percent">Percent</option>
        </select>
        <input
          type="number"
          placeholder="Value"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <input
          type="date"
          value={form.valid_from}
          onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <input
          type="date"
          value={form.valid_until}
          onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Usage Limit"
          value={form.usage_limit}
          onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
          className="mb-4 p-2 border rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Create Coupon
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Code</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Value</th>
            <th className="border p-2">Valid From</th>
            <th className="border p-2">Valid Until</th>
            <th className="border p-2">Usage Limit</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id}>
              <td className="border p-2">{coupon.code}</td>
              <td className="border p-2">{coupon.discount_type}</td>
              <td className="border p-2">{coupon.value}</td>
              <td className="border p-2">{coupon.valid_from}</td>
              <td className="border p-2">{coupon.valid_until}</td>
              <td className="border p-2">{coupon.usage_limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
