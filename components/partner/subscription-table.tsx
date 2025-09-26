"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  XCircle,
  ListCollapse,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

type Subscription = {
  id: string;
  subscription_type: string;
  start_date: string;
  end_date: string;
  status: "active" | "skipped" | "cancelled";
  users: { name: string; phone: string } | null;
};

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: mess } = await supabase
        .from("messes")
        .select("id")
        .eq("vendor_id", user.id)
        .single();
      if (!mess?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id, subscription_type, start_date, end_date, status, users(name, phone)"
        )
        .eq("mess_id", mess.id)
        .order("start_date", { ascending: false })
        .returns<Subscription[]>();

      if (error) {
        toast.error("Failed to fetch subscriptions.");
        console.error("Error fetching subscriptions:", error);
      } else {
        setSubscriptions(data);
      }
      setLoading(false);
    };

    fetchSubscriptions();
  }, [supabase]);

  const updateStatus = async (id: string, status: Subscription["status"]) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update subscription status.");
    } else {
      setSubscriptions(
        subscriptions.map((s) => (s.id === id ? { ...s, status } : s))
      );
      toast.success(`Subscription has been ${status}.`);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    if (filter === "all") return subscriptions;
    return subscriptions.filter((sub) => sub.status === filter);
  }, [subscriptions, filter]);

  const getStatusVariant = (status: Subscription["status"]) => {
    if (status === "active") return "default";
    if (status === "cancelled") return "destructive";
    return "secondary";
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            View and manage customer subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="skipped">Skipped</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          {loading ? (
            <SubscriptionTableSkeleton />
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 border-dashed border-2 rounded-lg">
              <ListCollapse className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold">
                No Subscriptions Found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no subscriptions with the status: {filter}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="font-medium">
                          {sub.users?.name ?? "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {sub.users?.phone ?? ""}
                        </div>
                      </TableCell>
                      <TableCell>{sub.subscription_type}</TableCell>
                      <TableCell>
                        {new Date(sub.start_date).toLocaleDateString()} -{" "}
                        {new Date(sub.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sub.status)}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {sub.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus(sub.id, "skipped")}
                              >
                                <PauseCircle className="mr-2 h-4 w-4" /> Pause
                              </DropdownMenuItem>
                            )}
                            {sub.status === "skipped" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus(sub.id, "active")}
                              >
                                <PlayCircle className="mr-2 h-4 w-4" /> Resume
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => updateStatus(sub.id, "cancelled")}
                              className="text-red-500"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(5)].map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-5 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(5)].map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
