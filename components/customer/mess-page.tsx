"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AppHeader from "./app-header";

interface Mess {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "hybrid";
  image: string;
  services: string[];
  rating: number;
}

interface MenuItem {
  id: string;
  item_name: string;
  price: number;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner";
}

// For the 'Reviews' tab (assuming a 'reviews' table)
interface Review {
  id: string;
  rating: number;
  comment: string;
  // You might want to join with the 'users' table to get the user's name
  user_name: string;
  created_at: string;
}

export default function MessDetailPage({ messId }: { messId: string }) {
  const supabase = createClient();

  const [mess, setMess] = useState<Mess | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "subscription" | "menu" | "reviews"
  >("subscription");
  const [selectedPlan, setSelectedPlan] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      const { data: messData, error: messError } = await supabase
        .from("messes")
        .select("*")
        .eq("id", messId)
        .single();

      if (messError) console.error("Error fetching mess:", messError);
      else setMess(messData);

      const { data: menuData, error: menuError } = await supabase
        .from("mess_menus")
        .select("*")
        .eq("mess_id", messId);

      if (menuError) console.error("Error fetching menu items:", menuError);
      else setMenuItems(menuData ?? []);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*, user:users(name)") // Example of a join
        .eq("mess_id", messId);

      if (reviewsError) console.error("Error fetching reviews:", reviewsError);
      else setReviews(reviewsData ?? []);

      setIsVisible(true);
      setLoading(false);
    }

    if (messId) {
      fetchAllData();
    }
  }, [messId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        Loading Kitchen...
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        Kitchen not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <AppHeader />
      <div
        className={`max-w-6xl mx-auto px-6 py-6 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Hero Image - Dynamically populated */}
        <div className="relative h-96 bg-gradient-to-r from-tifinnity-green to-sage-green rounded-2xl overflow-hidden mb-8 group">
          <Image
            width={600}
            height={600}
            src={mess.image ?? "/landing.jpeg"}
            alt={mess.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0  bg-opacity-40 flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white text-center transition-all duration-500 group-hover:scale-105">
              {mess.name}
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8 mb-8 border-b border-sage-green/20">
          {[
            { key: "subscription", label: "Subscription" },
            { key: "menu", label: "Menu" },
            { key: "reviews", label: "Reviews" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setActiveTab(tab.key as "menu" | "reviews" | "subscription")
              }
              className={`pb-4 px-2 font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? "text-tifinnity-green border-b-2 border-tifinnity-green"
                  : "text-sage-green hover:text-tifinnity-green"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500 ease-in-out">
          {/* --- SUBSCRIPTION TAB --- */}
          {activeTab === "subscription" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold text-tifinnity-green">
                Subscription Options
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Weekly Plan */}
                <Card className="relative overflow-hidden border-2 border-tifinnity-green transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-tifinnity-orange text-white rounded-b-lg px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                  <CardContent className="p-8 text-center pt-12">
                    <div className="text-4xl font-bold text-tifinnity-green mb-2">
                      ₹550
                    </div>
                    <div className="text-sage-green mb-6">/weekly</div>
                    <Button
                      onClick={() => setSelectedPlan("weekly")}
                      className="w-full bg-tifinnity-green hover:bg-tifinnity-green/90 text-white transition-all hover:scale-105"
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
                {/* Other plans can be added here */}
              </div>
              <div className="text-center">
                <Link
                  href={`/order/summary?messId=${messId}&plan=${selectedPlan}`}
                >
                  <Button className="px-12 py-3 bg-tifinnity-orange hover:bg-tifinnity-orange/90 text-white text-lg font-medium transition-all hover:scale-105 hover:shadow-lg">
                    Subscribe
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* --- MENU TAB --- */}
          {activeTab === "menu" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold text-tifinnity-green">
                Daily Menu
              </h3>
              {/* This section would be populated by the `menuItems` state */}
              <div className="bg-white rounded-lg p-6 border border-sage-green/20">
                <h4 className="font-semibold text-lg text-tifinnity-green">
                  Rajma Chawal
                  {menuItems.length !== 0 && (
                    <div>
                      {menuItems.map((item: MenuItem) => (
                        <div key={item.id}>{item.item_name}</div>
                      ))}
                    </div>
                  )}
                </h4>
                <p className="text-sage-green text-sm">
                  Kidney beans in a thick gravy with aromatic spices, served
                  with steamed rice.
                </p>
              </div>
            </div>
          )}

          {/* --- REVIEWS TAB --- */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-tifinnity-green">
                    {mess.rating.toFixed(1)}
                  </span>
                  <Star className="w-6 h-6 fill-orange-400 text-orange-400" />
                </div>
                {/* This would be populated by the `reviews` state length */}
                <span className="text-sage-green">Based on 150+ reviews</span>
              </div>

              {/* This section would be populated by mapping over the `reviews` state */}
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-tifinnity-orange rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">NT</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-tifinnity-green">
                        Nayan T.
                      </span>
                      <div className="flex my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 4
                                ? "fill-orange-400 text-orange-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-tifinnity-green">
                        &quote;Delicious and reminds me of home cooking.
                        Delivery is always on time.&quote;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
