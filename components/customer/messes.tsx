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
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Mess {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "hybrid";
  services: string;
  image: string | null;
  rating: number;
}

export default function MessesPage() {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchMesses = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("messes").select("*");
      setMesses(data || []);
      setIsLoading(false);
    };
    fetchMesses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-gray-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading messes...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <Image
          src="/landing.jpg"
          width={800}
          height={400}
          className="absolute inset-0 object-cover h-auto  w-full  -z-10 mx-auto opacity-60"
          alt="Tifinnity App"
        />
        <h1 className="text-4xl font-bold  tracking-tight">Find Your Tiffin</h1>
        <p className="text-muted-foreground mt-2">
          Discover the best messes near you.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {messes?.map((mess) => (
          <Card key={mess.id} className="overflow-hidden flex flex-col">
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
              <div className="flex items-center mb-2">
                <Badge
                  variant={mess.type === "veg" ? "secondary" : "destructive"}
                  className="mr-2"
                >
                  {mess.type}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">
                    {mess.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <CardTitle className="text-lg font-semibold mb-2">
                {mess.name}
              </CardTitle>
              {/* <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {mess.description}
              </p> */}
              <div className="flex flex-wrap gap-2">
                {mess.services?.split(",").map((service: string) => (
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
        ))}
      </div>
    </div>
  );
}
