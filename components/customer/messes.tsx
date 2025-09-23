import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default async function MessesPage() {
  const supabase = createClient();
  const { data: messes } = await supabase
    .from("messes")
    .select("id, name, type, services, rating, image");
  const { data: menus } = await supabase
    .from("mess_menus")
    .select("id, mess_id, item_name, price, menu_date, available")
    .eq("available", true)
    .gte("menu_date", new Date().toISOString().split("T")[0]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">
        Find Your Tiffin
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {messes?.map((mess) => (
          <Card key={mess.id}>
            <CardHeader>
              <CardTitle>{mess.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={mess.image || "/placeholder-tiffin.jpg"}
                alt={mess.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-gray-600">Type: {mess.type}</p>
              <p className="text-gray-600">
                Rating: {mess.rating.toFixed(1)} ★
              </p>
              <p className="text-gray-600 mb-4">{mess.services}</p>
              <h3 className="text-lg font-semibold">Today’s Menu</h3>
              <ul className="list-disc pl-5 mb-4">
                {menus
                  ?.filter((menu) => menu.mess_id === mess.id)
                  .map((menu) => (
                    <li key={menu.id} className="text-gray-700">
                      {menu.item_name} - ₹{menu.price}
                    </li>
                  ))}
              </ul>
              <div className="flex space-x-2">
                <a
                  href={`/customer/orders?mess_id=${mess.id}`}
                  className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
                >
                  Order Once
                </a>
                <a
                  href={`/customer/subscriptions?mess_id=${mess.id}`}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Subscribe
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
