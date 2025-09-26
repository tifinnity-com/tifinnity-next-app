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
  CheckCircle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: "placed" | "delivered" | "cancelled";
  users: { name: string; phone: string } | null;
  mess_menus: { item_name: string } | null;
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
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
        .from("orders")
        .select(
          "id, created_at, total_amount, status, users(name, phone), mess_menus(item_name)"
        )
        .eq("mess_id", mess.id)
        .order("created_at", { ascending: false })
        .returns<Order[]>();

      if (error) {
        toast.error("Failed to fetch orders.");
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [supabase]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update order status.");
    } else {
      setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success(`Order marked as ${status}.`);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const getStatusVariant = (status: Order["status"]) => {
    if (status === "delivered") return "secondary";
    if (status === "cancelled") return "destructive";
    return "default";
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage incoming customer orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="placed">Placed</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          {loading ? (
            <OrderTableSkeleton />
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 border-dashed border-2 rounded-lg">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold">No Orders Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no orders with the status: {filter}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">
                          {order.users?.name ?? "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.users?.phone ?? ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{order.mess_menus?.item_name ?? "N/A"}</div>
                        <div className="text-sm font-bold">
                          ₹{order.total_amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
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
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(order.id, "delivered")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark as
                              Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus(order.id, "cancelled")
                              }
                              className="text-red-500"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Cancel Order
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

function OrderTableSkeleton() {
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
