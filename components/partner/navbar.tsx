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
import Image from "next/image";

const navLinks = [
  { href: "/partner/dashboard", label: "Dashboard" },
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
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[320px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>
                    <Link href="/partner/dashboard" className="flex items-center gap-2 text-2xl font-bold text-primary" onClick={() => setMobileMenuOpen(false)}>
                        <Image
                            className="w-auto h-14 object-cover py-2"
                            src="/logo.jpg"
                            alt="logo"
                            width={600}
                            height={400}
                        />
                      <span>Tiffinity Partner</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 p-4 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={cn("px-3 py-2 rounded-md text-base font-medium transition-colors", pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/partner/dashboard" className="hidden md:flex items-center gap-2 text-2xl font-bold text-primary">
              <ChefHat />
              <span>Tiffinity Partner</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.slice(0, 5).map((link) => (
              <Link key={link.href} href={link.href} className={cn("px-3 py-2 rounded-md text-sm font-medium transition-colors", pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground">More</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navLinks.slice(5).map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" />
                  <AvatarFallback><UserIcon /></AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name ?? "Partner"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email ?? "No email"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/partner/dashboard/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/partner/dashboard/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}