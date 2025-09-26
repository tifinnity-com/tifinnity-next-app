"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Utensils } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface Mess {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "hybrid";
  image: string;
  services: string;
  rating: number;
  description: string;
}

interface MenuItem {
  id: string;
  item_name: string;
  price: number;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner";
  menu_date: string; // Assuming date is in 'YYYY-MM-DD' format
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  users: { name: string };
  created_at: string;
}

export default function MessDetailPage({ messId }: { messId: string }) {
  const supabase = createClient();

  const [mess, setMess] = useState<Mess | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("weekly");

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
        .select("*, users(name)")
        .eq("mess_id", messId);

      if (reviewsError) console.error("Error fetching reviews:", reviewsError);
      else setReviews(reviewsData ?? []);

      setLoading(false);
    }

    if (messId) {
      fetchAllData();
    }
  }, [messId, supabase]);

  const groupMenuByCategory = (menu: MenuItem[]) => {
    return menu.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  };

  const dailyMenu = groupMenuByCategory(
    menuItems.filter(
      (item) =>
        new Date(item.menu_date).toDateString() === new Date().toDateString()
    )
  );

  if (loading) {
    return <MessDetailSkeleton />;
  }

  if (!mess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Mess not found.</p>
      </div>
    );
  }

  const proceedSubscription = async (messId: string, plan: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const end_date = new Date();

    if (plan == "daily") {
      end_date.setDate(end_date.getDate() + 1);
    } else if (plan == "weekly") {
      end_date.setDate(end_date.getDate() + 7);
    } else if (plan == "monthly") {
      end_date.setMonth(end_date.getMonth() + 1);
    }
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        mess_id: messId,
        subscription_type: plan,
        start_date: new Date().toISOString(),
        end_date: end_date.toISOString(),
        status: "active",
      });

    if (subscription) {
      toast.success("Subscription created successfully!");
    } else {
      toast.error("Error creating subscription.");
    }

    if (error) {
      console.error("Error creating subscription:", error);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6">
      <Card className="overflow-hidden">
        <CardHeader className="p-0 relative h-64 md:h-96">
          <Image
            src={mess.image || "/placeholder-tiffin.jpg"}
            alt={mess.name}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {mess.name}
            </h1>
            <p className="text-lg text-gray-200 mt-1">{mess.description}</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
            <Badge variant={mess.type === "veg" ? "secondary" : "destructive"}>
              {mess.type}
            </Badge>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold text-lg">
                {mess.rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} reviews)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mess.services?.split(",").map((service) => (
                <Badge key={service} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="menu">Today&apos;s Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
            </TabsList>
            <TabsContent value="menu" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>What&apos;s Cooking Today</CardTitle>
                  <CardDescription>
                    A glimpse of today&apos;s specials delicious offerings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(dailyMenu).length > 0 ? (
                    Object.entries(dailyMenu).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-xl font-semibold mb-3 flex items-center">
                          <Utensils className="mr-2 h-5 w-5" /> {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((item) => (
                            <Card key={item.id}>
                              <CardHeader>
                                <CardTitle className="text-md">
                                  {item.item_name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </CardContent>
                              <CardFooter>
                                <p className="font-semibold text-md">
                                  ₹{item.price}
                                </p>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No menu available for today.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    See what others are saying about us.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="ml-auto text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold">{review.users.name}</p>
                        <p className="text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subscribe" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Plan</CardTitle>
                  <CardDescription>
                    Select a subscription plan that works for you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SubscriptionPlanCard
                    plan="weekly"
                    price="550"
                    selectedPlan={selectedPlan}
                    onSelect={setSelectedPlan}
                  />
                  <SubscriptionPlanCard
                    plan="monthly"
                    price="2000"
                    selectedPlan={selectedPlan}
                    onSelect={setSelectedPlan}
                  />
                  <SubscriptionPlanCard
                    plan="daily"
                    price="100"
                    selectedPlan={selectedPlan}
                    onSelect={setSelectedPlan}
                  />
                </CardContent>
                <Separator className="my-6" />
                <CardFooter className="flex-col items-start gap-4">
                  <div className="font-semibold">
                    Selected Plan:{" "}
                    <span className="text-primary capitalize">
                      {selectedPlan}
                    </span>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="w-full"
                    onClick={() => proceedSubscription(messId, selectedPlan)}
                  >
                    <Link
                      href={`/customer/subscriptions?mess_id=${messId}&plan=${selectedPlan}`}
                    >
                      Proceed to Subscription
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionPlanCard({
  plan,
  price,
  selectedPlan,
  onSelect,
}: {
  plan: string;
  price: string;
  selectedPlan: string;
  onSelect: (plan: string) => void;
}) {
  const isSelected = plan === selectedPlan;
  return (
    <Card
      className={`cursor-pointer ${isSelected ? "border-primary" : ""}`}
      onClick={() => onSelect(plan)}
    >
      <CardHeader>
        <CardTitle className="capitalize">{plan}</CardTitle>
        <CardDescription>
          ₹{price} / {plan === "daily" ? "day" : plan.slice(0, -2)}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" variant={isSelected ? "default" : "outline"}>
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function MessDetailSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-64 md:h-96 w-full" />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="menu">Today&apos;s Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
            </TabsList>
            <TabsContent value="menu" className="mt-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
