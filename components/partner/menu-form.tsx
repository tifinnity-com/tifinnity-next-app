"use client";
import { useState, useEffect, useMemo, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import { format } from "date-fns";

// UI Components from shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

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
  const [error, setError] = useState<PostgrestError | null>(null);

  const supabase: SupabaseClient = createClient();

  // --- DATA FETCHING & REAL-TIME SUBSCRIPTION ---
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
        if (error) setError(error);
      }
      setIsLoading(false);
    };

    setup();

    const channel = supabase
      .channel("mess_menus_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mess_menus" },
        (payload) => {
          // A more efficient way to handle updates without a full refetch
          if (payload.eventType === "INSERT") {
            setMenus((current) => [...current, payload.new as MenuItem]);
          }
          if (payload.eventType === "UPDATE") {
            setMenus((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as MenuItem) : item
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setMenus((current) =>
              current.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Group menus by date for a better display
  const groupedMenus = useMemo(() => {
    return menus.reduce((acc: { [key: string]: MenuItem[] }, menu) => {
      const date = format(new Date(menu.menu_date), "PPP"); // e.g., "September 23rd, 2025"
      if (!acc[date]) acc[date] = [];
      acc[date].push(menu);
      return acc;
    }, {});
  }, [menus]);

  // --- CRUD OPERATIONS ---
  const handleFormSubmit = async (e: FormEvent) => {
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
      ? supabase.from("mess_menus").update(payload).eq("id", id)
      : supabase.from("mess_menus").insert(payload);

    const { error } = await promise;
    if (error) {
      alert("Error saving item: " + error.message);
    } else {
      setEditingItem(null); // Close the sheet on success
    }
    setIsSubmitting(false);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await supabase
      .from("mess_menus")
      .update({ available: !item.available })
      .eq("id", item.id);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await supabase.from("mess_menus").delete().eq("id", itemToDelete.id);
    setItemToDelete(null);
  };

  // --- RENDER LOGIC ---
  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Menu Management
            </h1>
            <p className="text-gray-500 mt-1">
              Add, edit, and manage your daily menu items.
            </p>
          </div>
          <Button size="lg" onClick={() => setEditingItem({})}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
          </Button>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {/* Menu List */}
        {!isLoading && Object.keys(groupedMenus).length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700">
              No menu items yet.
            </h3>
            <p className="text-gray-500 mt-2">
              Click &quot;Add New Item&quot; to get started!
            </p>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(groupedMenus).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {date}
              </h2>
              {/* Cards for Mobile */}
              <div className="grid gap-4 sm:hidden">
                {items.map((item) => (
                  <Card key={item.id} className="shadow-sm">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{item.item_name}</p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => handleToggleAvailability(item)}
                        />
                        <ItemActionsDropdown
                          item={item}
                          setEditingItem={setEditingItem}
                          setItemToDelete={setItemToDelete}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Table for Desktop */}
              <Card className="hidden sm:block shadow-sm">
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
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Sheet */}
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
            <div className="py-6 space-y-4">
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
                )}
                Save Item
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
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
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- HELPER COMPONENT FOR ACTIONS ---
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
