"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User as UserIcon, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/partner/dashboard/mess", label: "Mess Profile" },
  { href: "/partner/dashboard/menu", label: "Menu" },
  { href: "/partner/dashboard/orders", label: "Orders" },
  { href: "/partner/dashboard/subscriptions", label: "Subscriptions" },
  { href: "/partner/dashboard/payments", label: "Payments" },
  { href: "/partner/dashboard/reviews", label: "Reviews" },
  { href: "/partner/dashboard/coupons", label: "Coupons" },
  { href: "/partner/dashboard/analytics", label: "Analytics" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  // Renamed 'User' state to 'user' to avoid conflicts
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      console.log("Fetched user:", data.user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu Trigger */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[320px] px-4">
                  <SheetHeader>
                    <SheetTitle>
                      <Link
                        href="/partner/dashboard"
                        className="flex items-center gap-2 text-2xl font-bold text-tifinnity-green"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ChefHat />
                        <span>Tiffinity Partner</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-8 flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "px-3 py-2 rounded-md text-base font-medium transition-colors",
                          pathname === link.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <Link
              href="/partner/dashboard"
              className="hidden md:flex items-center gap-2 text-2xl font-bold text-tifinnity-green"
            >
              <ChefHat />
              <span>Tiffinity Partner</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    <UserIcon />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {/* Display fetched user name */}
                    {user?.user_metadata?.full_name ?? "Partner"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {/* Display fetched user email */}
                    {user?.email ?? "No email"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => router.push("/partner/dashboard/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push("/partner/dashboard/settings")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Added logout functionality */}
              <DropdownMenuItem onSelect={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
