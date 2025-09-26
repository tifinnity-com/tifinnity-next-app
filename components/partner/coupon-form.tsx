"use client";
import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, TicketSlash } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Coupon = {
  id: string;
  code: string;
  discount_type: "flat" | "percent";
  value: number;
  valid_until: string;
  usage_limit: number;
  mess_id: string;
};

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: mess } = await supabase
        .from("messes")
        .select("id")
        .eq("vendor_id", user.id)
        .single();
      if (!mess?.id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("mess_id", mess.id);
      if (error) {
        toast.error("Failed to fetch coupons.");
        console.error("Error fetching coupons:", error);
      } else {
        setCoupons(data as Coupon[]);
      }
      setIsLoading(false);
    };
    fetchCoupons();
  }, [supabase]);

  const handleFormSubmit = async (formData: Partial<Coupon>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return toast.error("Not authenticated");

    const { data: mess } = await supabase
      .from("messes")
      .select("id")
      .eq("vendor_id", user.id)
      .single();
    if (!mess?.id) return toast.error("Mess not found");

    const payload = {
      ...formData,
      mess_id: mess.id,
      value: Number(formData.value),
    };

    const promise = formData.id
      ? supabase
          .from("coupons")
          .update(payload)
          .eq("id", formData.id)
          .select()
          .single()
      : supabase.from("coupons").insert(payload).select().single();

    const { data, error } = await promise;

    if (error) {
      toast.error(`Failed to ${formData.id ? "update" : "create"} coupon.`);
    } else if (data) {
      toast.success(`Coupon ${formData.id ? "updated" : "created"}!`);
      setCoupons((current) =>
        formData.id
          ? current.map((c) => (c.id === data.id ? data : c))
          : [...current, data]
      );
      setEditingCoupon(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete coupon.");
    } else {
      setCoupons(coupons.filter((c) => c.id !== id));
      toast.success("Coupon deleted.");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Coupon Management</CardTitle>
            <CardDescription>
              Create and manage promotional coupons for your customers.
            </CardDescription>
          </div>
          <Button onClick={() => setEditingCoupon({})}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CouponTableSkeleton />
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 border-dashed border-2 rounded-lg">
              <TicketSlash className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold">No Coupons Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Click &quot;Create Coupon&quot; to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Expires On</TableHead>
                    <TableHead>Usage Limit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-semibold">
                        {coupon.code}
                      </TableCell>
                      <TableCell>{coupon.discount_type}</TableCell>
                      <TableCell>
                        {coupon.discount_type === "percent"
                          ? `${coupon.value}%`
                          : `₹${coupon.value}`}
                      </TableCell>
                      <TableCell>
                        {new Date(coupon.valid_until).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{coupon.usage_limit}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCoupon(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CouponFormDialog
        isOpen={!!editingCoupon}
        onClose={() => setEditingCoupon(null)}
        onSubmit={handleFormSubmit}
        coupon={editingCoupon}
      />
    </div>
  );
}

function CouponFormDialog({
  isOpen,
  onClose,
  onSubmit,
  coupon,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Coupon>) => void;
  coupon: Partial<Coupon> | null;
}) {
  const [formData, setFormData] = useState<Partial<Coupon> | null>(coupon);

  useEffect(() => {
    setFormData(coupon);
  }, [coupon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) onSubmit(formData);
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {coupon?.id ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              value={formData.code || ""}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_type">Discount Type</Label>
              <Select
                value={formData.discount_type || "flat"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    discount_type: value as "flat" | "percent" | undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, value: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until?.split("T")[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, valid_until: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage_limit">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit: Number(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {coupon?.id ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CouponTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(6)].map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-5 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(6)].map((_, j) => (
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
