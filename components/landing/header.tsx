"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Menu, X } from "lucide-react";
import Link from "next/link";
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#feature", label: "Features" },
    { href: "#about", label: "About" },
    { href: "/auth/signup/student", label: "Sign in" },
  ];

  return (
    <header className="fixed w-full left-0 right-0 top-0 bg-tifinnity-cream backdrop-blur-2xl  mx-auto z-50 border">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2 ">
          <div className="w-8 h-8 bg-tifinnity-green rounded flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-tifinnity-green">
              Tiffinity
            </h1>
            <p className="text-xs text-tifinnity-gray">
              Cooking smiles, delivering joy.
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-tifinnity-green hover:text-tifinnity-orange transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          className="md:hidden text-tifinnity-green"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>

        {isMenuOpen && (
          <div className="md:hidden bg-tifinnity-cream px-4 py-4 border-t border-tifinnity-gray/20 absolute top-16 left-0 right-0 z-10 transition-all duration-300 ease-in-out">
            <nav className="flex flex-col gap-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-tifinnity-green hover:text-tifinnity-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
