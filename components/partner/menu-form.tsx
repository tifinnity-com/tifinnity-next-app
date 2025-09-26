"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

import {
  PlusCircle,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Loader2,
  Trash2,
  Pencil,
  UtensilsCrossed,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { SupabaseClient } from "@supabase/supabase-js";

type MenuItem = {
  id: string;
  item_name: string;
  price: number;
  menu_date: string;
  available: boolean;
  mess_id: string;
};

type FormState = Partial<MenuItem>;

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [messId, setMessId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FormState | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const setup = async () => {
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

      if (mess?.id) {
        setMessId(mess.id);
        const { data, error } = await supabase
          .from("mess_menus")
          .select("*")
          .eq("mess_id", mess.id)
          .order("menu_date", { ascending: false });

        if (data) setMenus(data);
        if (error) toast.error("Failed to fetch menu items.");
      }
      setIsLoading(false);
    };

    setup();
  }, [supabase]);

  const groupedMenus = useMemo(() => {
    return menus.reduce((acc: { [key: string]: MenuItem[] }, menu) => {
      const date = format(new Date(menu.menu_date), "PPP");
      if (!acc[date]) acc[date] = [];
      acc[date].push(menu);
      return acc;
    }, {});
  }, [menus]);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem || !messId) return;

    setIsSubmitting(true);
    const { id, ...formData } = editingItem;

    const payload = {
      ...formData,
      mess_id: messId,
      price: Number(formData.price || 0),
    };

    const promise = id
      ? supabase
          .from("mess_menus")
          .update(payload)
          .eq("id", id)
          .select()
          .single()
      : supabase.from("mess_menus").insert(payload).select().single();

    const { data, error } = await promise;

    if (error) {
      toast.error("Error saving item: " + error.message);
    } else if (data) {
      if (id) {
        setMenus(menus.map((m) => (m.id === id ? data : m)));
      } else {
        setMenus([data, ...menus]);
      }
      setEditingItem(null);
      toast.success("Menu item saved!");
    }
    setIsSubmitting(false);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from("mess_menus")
      .update({ available: !item.available })
      .eq("id", item.id);
    if (error) {
      toast.error("Failed to update status.");
    } else {
      setMenus(
        menus.map((m) =>
          m.id === item.id ? { ...m, available: !m.available } : m
        )
      );
      toast.success("Status updated.");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase
      .from("mess_menus")
      .delete()
      .eq("id", itemToDelete.id);
    if (error) {
      toast.error("Failed to delete item.");
    } else {
      setMenus(menus.filter((m) => m.id !== itemToDelete.id));
      toast.success("Menu item deleted.");
    }
    setItemToDelete(null);
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your daily menu items.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() =>
            setEditingItem({
              available: true,
              menu_date: new Date().toISOString(),
            })
          }
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
        </Button>
      </div>

      {isLoading ? (
        <MenuSkeleton />
      ) : Object.keys(groupedMenus).length === 0 ? (
        <Card className="text-center py-20 border-2 border-dashed bg-muted/20">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold">No menu items found</h3>
          <p className="text-muted-foreground mt-2">
            Click &quot;Add New Item&quot; to build your menu.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMenus).map(([date, items]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{date}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`avail-${item.id}`}
                              checked={item.available}
                              onCheckedChange={() =>
                                handleToggleAvailability(item)
                              }
                            />
                            <Label
                              htmlFor={`avail-${item.id}`}
                              className={
                                item.available
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </Label>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <ItemActionsDropdown
                            item={item}
                            setEditingItem={setEditingItem}
                            setItemToDelete={setItemToDelete}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <SheetContent className="sm:max-w-lg">
          <form onSubmit={handleFormSubmit}>
            <SheetHeader>
              <SheetTitle>
                {editingItem?.id ? "Edit Menu Item" : "Add New Menu Item"}
              </SheetTitle>
              <SheetDescription>
                Fill in the details for the menu item below.
              </SheetDescription>
            </SheetHeader>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name</Label>
                <Input
                  id="item_name"
                  value={editingItem?.item_name || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingItem?.price || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingItem?.menu_date
                          ? format(new Date(editingItem.menu_date), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          editingItem?.menu_date
                            ? new Date(editingItem.menu_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setEditingItem({
                            ...editingItem,
                            menu_date: date?.toISOString(),
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Save Item
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item &quot;{itemToDelete?.item_name}&quot;from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ItemActionsDropdown({
  item,
  setEditingItem,
  setItemToDelete,
}: {
  item: MenuItem;
  setEditingItem: (item: FormState) => void;
  setItemToDelete: (item: MenuItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setEditingItem(item)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setItemToDelete(item)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
