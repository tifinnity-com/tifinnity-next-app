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

export default async function MessesPage() {
  const supabase = createClient();
  const { data: messes } = await supabase
    .from("messes")
    .select("id, name, type, services, rating, image, description");

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
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {mess.description}
              </p>
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
