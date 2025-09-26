"use client";
import Link from "next/link";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { ChefHat, Menu } from "lucide-react";
import { useIsMobile } from "@/hook/use-mobile";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Navigation links data
const navItems = [
  { href: "/customer/messes", label: "Find Mess" },
  { href: "/customer/subscriptions", label: "My Plans" },
  { href: "/customer/orders", label: "Orders" },
  { href: "/customer/reviews", label: "Reviews" },
  { href: "/customer/loyalty", label: "Rewards" },
  { href: "/customer/profile", label: "Profile" },
];

export default function AppHeader() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const DesktopNav = () => (
    <div className="flex items-center gap-6 text-md font-medium text-gray-700">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-tifinnity-green",
            pathname === item.href
              ? "text-tifinnity-green font-bold"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
      <Button
        onClick={handleLogout}
        variant="ghost"
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        Logout
      </Button>
    </div>
  );

  const MobileNav = () => (
    <div className="flex  flex-col space-y-2 pt-6 text-lg pb-4 p-3">
      {navItems.map((item) => (
        <SheetClose asChild key={item.href}>
          <Link
            href={item.href}
            className={cn(
              "p-3 rounded-md transition-colors",
              pathname === item.href
                ? "text-white bg-tifinnity-green hover:bg-tifinnity-green/80 font-semibold"
                : "text-gray-800 hover:bg-gray-100"
            )}
          >
            {item.label}
          </Link>
        </SheetClose>
      ))}
      <div className="px-3 ">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full bg-tifinnity-green hover:bg-tifinnity-green/90"
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="sticky top-0 z-50 w-full   border-b"
    >
      <div className="container  flex h-16 max-w-7xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/customer"
          className="flex items-center gap-3 text-2xl font-bold text-tifinnity-green transition-transform hover:scale-105"
        >
          <div className="bg-tifinnity-green rounded-md p-1.5">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <span className="hidden sm:inline-block">Tifinnity</span>
        </Link>

        {isMobile ? (
          <Sheet>
            <VisuallyHidden>
              <SheetTitle>Menu</SheetTitle>
            </VisuallyHidden>

            <SheetTrigger className="bg-tifinnity-cream" asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-tifinnity-cream">
              <MobileNav />
            </SheetContent>
          </Sheet>
        ) : (
          <DesktopNav />
        )}
      </div>
    </motion.header>
  );
}
