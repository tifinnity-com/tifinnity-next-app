import { Card, CardContent } from "@/components/ui/card";
import {
  ChefHat,
  Clock,
  Shield,
  Users,
  Smartphone,
  IndianRupee,
} from "lucide-react";

export default function WhyChooseTiffinity() {
  const features = [
    {
      icon: ChefHat,
      title: "Home-Style Comfort",
      description:
        "Savor meals prepared with love and care, just like home through generations.",
      bgColor: "bg-tifinnity-green",
    },
    {
      icon: Clock,
      title: "Fresh & On Time",
      description:
        "Cooked fresh, delivered on your schedule. Enjoy hot food that’s never been frozen.",
      bgColor: "bg-tifinnity-orange",
    },
    {
      icon: Shield,
      title: "Trusted Quality",
      description:
        "Every cook is background-verified and every meal meets our high standards as much as the food.",
      bgColor: "bg-tifinnity-green",
    },
    {
      icon: Users,
      title: "Mess Community First",
      description:
        "Supporting home cooks while sharing authentic flavors. We’re building a community, one plate at a time.",
      bgColor: "bg-tifinnity-green",
    },
    {
      icon: Smartphone,
      title: "Simple & Seamless",
      description:
        "Hassle-free ordering, effortless delivery, and easy payment through our app or website.",
      bgColor: "bg-tifinnity-green",
    },
    {
      icon: IndianRupee,
      title: "Affordable for All",
      description:
        "Wallet-friendly pricing that fits every budget—great food without breaking a sweat.",
      bgColor: "bg-tifinnity-orange",
    },
  ];

  return (
    <section
      id="feature"
      className="px-4 py-12 md:px-6 md:py-24  max-w-7xl mx-auto"
    >
      <div className="text-center mb-8 md:mb-12">
        <h3 className="text-3xl font-bold text-tifinnity-green mb-4">
          Why Choose Tiffinity?
        </h3>
        <p className="text-tifinnity-gray max-w-2xl mx-auto text-base">
          We deliver more than food—we deliver trust. Fresh, wholesome,
          home-style mess meals that nourish both your body and your heart.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-[#f9fbe7] border-none shadow-sm hover:shadow-md transition-shadow p-6 rounded-xl"
          >
            <CardContent className="p-0 text-center">
              <div
                className={`w-12 h-12 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-tifinnity-green mb-2 text-lg">
                {feature.title}
              </h4>
              <p className="text-sm text-tifinnity-gray">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
