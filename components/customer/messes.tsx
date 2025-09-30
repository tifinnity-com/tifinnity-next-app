"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Mess {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "hybrid";
  services: string;
  image: string | null;
  rating: number;
}

function HeroSection({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center mb-12 text-center py-16 sm:py-24  overflow-hidden">
      {/* Background Image with a darkening overlay for better text readability */}
      <Image
        src="/hero-student.jpg"
        fill
        className="object-cover w-full h-auto -z-20"
        alt="Tiffin service background"
        priority
      />
      <div className="absolute inset-0 bg-black/20 -z-10" />

      <div className="container max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white ">
          Find Your Perfect Tiffin
        </h1>
        <p className="mt-4 text-lg text-gray-100 ">
          Discover the best and most hygienic messes near you.
        </p>
        <div className="relative mt-8 max-w-2xl w-7/8 mx-auto bg-white rounded-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black rounded-2xl" />
          <Input
            className="w-full pl-10 h-12 text-black "
            placeholder="Search by mess name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// --- Mess Card Component ---
function MessCard({ mess }: { mess: Mess }) {
  const services = mess.services?.split(",").map((s) => s.trim()) || [];

  return (
    <Card className="overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Image
          src={mess.image || "/placeholder-tiffin.jpg"}
          alt={mess.name}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant={
              mess.type === "veg"
                ? "secondary"
                : mess.type === "hybrid"
                ? "default"
                : "destructive"
            }
            className="capitalize"
          >
            {mess.type}
          </Badge>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold text-sm">{mess.rating.toFixed(1)}</span>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold mb-2">
          {mess.name}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          {services.map((service) => (
            <Badge key={service} variant="outline">
              {service}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/40">
        <Button asChild className="w-full">
          <Link href={`/customer/messes/${mess.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Skeleton Loader for the Mess Card ---
// Provides a better loading experience by showing a content placeholder.
function MessCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/40">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

// --- Main Page Component ---
export default function MessesPage() {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMesses = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("messes").select("*");

      if (data) {
        setMesses(data);
      }
      if (error) {
        console.error("Failed to fetch messes:", error);
      }
      setIsLoading(false);
    };
    fetchMesses();
  }, []);

  // Filter messes based on the search query, memoized for performance
  const filteredMesses = useMemo(() => {
    return messes.filter((mess) =>
      mess.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messes, searchQuery]);

  return (
    <div className="container  mx-auto ">
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {isLoading ? (
        // Show a grid of skeletons while loading

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <MessCardSkeleton key={index} />
                ))}
            </div>
      ) : filteredMesses.length > 0 ? (

            <div className="space-y-6 p-8 sm:p-4 lg:p-12">
                <div>
                    <h3 className="text-3xl font-semibold">Recommended for you</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                    {filteredMesses.map((mess) => (
                        <MessCard key={mess.id} mess={mess} />
                    ))}
                </div>
            </div>
      ) : (
        // Show message if no results are found
        <div className="text-center py-16 p-4">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No Messes Found
          </h2>
          <p className="mt-2 text-gray-500">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
