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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  item_name: string;
  price: number;
  available: boolean;
}

interface Address {
  id: string;
  address_line1: string;
  city: string;
}

export default function OrderForm() {
  const [menus, setMenus] = useState<MenuItem[] | null>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>([]);
  const searchParams = useSearchParams();
  const messId = searchParams.get("mess_id");

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: menuData } = await supabase
        .from("mess_menus")
        .select("id, item_name, price, available")
        .eq("mess_id", messId)
        .eq("available", true);
      setMenus(menuData);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: addressData } = await supabase
        .from("addresses")
        .select("id, address_line1, city")
        .eq("user_id", user?.id);
      setAddresses(addressData);
    };
    fetchData();

    const channel = supabase
      .channel("menus")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mess_menus",
          filter: `mess_id=eq.${messId}`,
        },
        () => {
          fetchData();
          toast("Menu updated!");
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [messId, supabase]);

  const applyCoupon = async () => {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("id, value, discount_type")
      .eq("code", couponCode)
      .gte("valid_until", new Date().toISOString().split("T")[0])
      .single();
    if (coupon) {
      toast.success("Coupon applied!");
      return coupon;
    } else {
      toast.error("Invalid or expired coupon");
      return null;
    }
  };

  const placeOrder = async () => {
    const coupon = await applyCoupon();
    const totalAmount = selectedItems.reduce((sum, id) => {
      const item = menus?.find((m) => m.id === id);
      return sum + (item?.price || 0);
    }, 0);
    const discountedAmount = coupon
      ? coupon.discount_type === "flat"
        ? totalAmount - coupon.value
        : totalAmount * (1 - coupon.value / 100)
      : totalAmount;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id,
        mess_id: messId,
        menu_id: selectedItems[0], // Single item for simplicity
        total_amount: discountedAmount,
        status: "placed",
        address_id: addressId,
      })
      .select("id")
      .single();

    if (coupon && order) {
      await supabase.from("coupon_redemptions").insert({
        coupon_id: coupon.id,
        user_id: user?.id,
        order_id: order.id,
      });
    }

    if (error) toast.error(error.message);
    else toast.success("Order placed! You’ll receive your tiffin soon.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-7xl mx-auto p-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">Order Your Tiffin</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl mb-4">Select Items</h2>
          {menus?.map((menu) => (
            <div key={menu.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedItems.includes(menu.id)}
                onChange={(e) => {
                  if (e.target.checked)
                    setSelectedItems([...selectedItems, menu.id]);
                  else
                    setSelectedItems(
                      selectedItems.filter((id) => id !== menu.id)
                    );
                }}
                className="mr-2"
              />
              <span>
                {menu.item_name} - ₹{menu.price}
              </span>
            </div>
          ))}
          <h2 className="text-xl mt-6 mb-4">Delivery Address</h2>
          <Select value={addressId!} onValueChange={setAddressId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Address" />
            </SelectTrigger>
            <SelectContent>
              {addresses?.map((addr) => (
                <SelectItem key={addr.id} value={addr.id}>
                  {addr.address_line1}, {addr.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <h2 className="text-xl mt-6 mb-4">Apply Coupon</h2>
          <Input
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={placeOrder}
            className="bg-orange-500 hover:bg-orange-600 w-full"
          >
            Place Order
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
