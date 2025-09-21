import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Nayan Tawale",
      initials: "NT",
      date: "15 May 2023",
      text: "Tiffinity has been such a game-changer for me! The meals remind me of my grandma's cooking—simple, fresh, and full of flavor. Delivery is always on time, and I love the variety. The only thing missing for me is a few more vegetarian options.",
    },
    {
      name: "Nishikant Waghmode",
      initials: "NW",
      date: "15 May 2023",
      text: "Tiffinity is honestly a lifesaver. I work long hours, so I don't always have time to cook, but I still want to eat healthy, home-style food. With Tiffinity, I get exactly that—delicious meals without the stress. Couldn't recommend it more!",
    },
    {
      name: "Pratham Chavhan",
      initials: "PC",
      date: "15 May 2023",
      text: "I love the convenience of Tiffinity. It's so easy to order, and the meals are always fresh and tasty. The only reason I didn't give it 5 stars is that I wish there were more vegetarian options.",
    },
  ];

  return (
    <section
      id="about"
      className="px-4 py-12 md:px-6 md:py-16 max-w-7xl mx-auto"
    >
      <h3 className="text-3xl font-bold text-tifinnity-green text-center mb-8 md:mb-12">
        What Our Customers Say
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="bg-white border-none shadow-sm hover:shadow-md transition-shadow p-6 rounded-xl"
          >
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={`/placeholder.svg?height=48&width=48`}
                    alt={testimonial.name}
                  />
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-tifinnity-green">
                      {testimonial.name}
                    </h4>
                    <span className="text-sm text-tifinnity-gray">
                      {testimonial.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-tifinnity-orange text-tifinnity-orange"
                      />
                    ))}
                  </div>
                  <p className="text-tifinnity-gray text-sm">
                    &quot;{testimonial.text}&quot;
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
