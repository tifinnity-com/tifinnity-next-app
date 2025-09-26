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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Banknote } from "lucide-react";
import toast from "react-hot-toast";

type Payment = {
  id: string;
  amount: number;
  platform_fee: number;
  payment_status: "completed" | "pending" | "failed";
  payment_date: string;
  users: { name: string } | null;
};

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchPayments = async () => {
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
        .from("payments")
        .select(
          "id, amount, platform_fee, payment_status, payment_date, users(name)"
        )
        .eq("mess_id", mess.id)
        .order("payment_date", { ascending: false })
        .returns<Payment[]>();

      if (error) {
        toast.error("Failed to fetch payments.");
        console.error("Error fetching payments:", error);
      } else {
        setPayments(data);
      }
      setLoading(false);
    };

    fetchPayments();
  }, [supabase]);

  const filteredPayments = useMemo(() => {
    if (filter === "all") return payments;
    return payments.filter((p) => p.payment_status === filter);
  }, [payments, filter]);

  const getStatusVariant = (status: Payment["payment_status"]) => {
    if (status === "completed") return "default";
    if (status === "failed") return "destructive";
    return "secondary";
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            A record of all transactions and payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
          {loading ? (
            <PaymentTableSkeleton />
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 border-dashed border-2 rounded-lg">
              <Banknote className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold">No Payments Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no payments with the status: {filter}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Net Payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.users?.name ?? "N/A"}</TableCell>
                      <TableCell className="font-medium">
                        ₹{(payment.amount - payment.platform_fee).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(payment.payment_status)}
                        >
                          {payment.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(payment.payment_date).toLocaleDateString()}
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

function PaymentTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(4)].map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-5 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(4)].map((_, j) => (
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
