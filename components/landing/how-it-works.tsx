import { ChefHat, Smartphone, Clock, Shield } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: ChefHat,
      title: "Browse Local Cooks",
      description:
        "Discover talented home cooks in your area and explore their authentic cuisines.",
    },
    {
      icon: Smartphone,
      title: "Place Your Order",
      description:
        "Choose from freshly prepared meals and customize your preferences.",
    },
    {
      icon: Clock,
      title: "Fresh Preparation",
      description:
        "Your meal is prepared with care using traditional recipes and fresh ingredients.",
    },
    {
      icon: Shield,
      title: "Doorstep Delivery",
      description:
        "Receive your warm, home-cooked food delivered fresh to your doorstep.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="px-4 py-12 h-screen flex flex-col items-center justify-center md:px-6 md:py-16 lg:py-32 max-w-7xl mx-auto text-center"
    >
      <h3 className="text-3xl font-bold text-tifinnity-green mb-4">
        How it Works
      </h3>
      <p className="text-tifinnity-gray mb-8 md:mb-12 max-w-2xl mx-auto text-base">
        Getting delicious home-cooked meals has never been easier. Here&apos;s
        how Tiffinity works in just 4 simple steps.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-tifinnity-orange rounded-full flex items-center justify-center mb-4">
              <step.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h4 className="font-semibold text-tifinnity-green mb-2 text-lg">
              {step.title}
            </h4>
            <p className="text-sm text-tifinnity-gray max-w-xs">
              {step.description}
            </p>
            {index < steps.length - 1 && (
              <div className="absolute right-0 top-8 md:right-[-1rem] md:top-10 transform md:-translate-y-1/2 hidden md:block">
                <div className="w-4 md:w-8 h-0.5 bg-tifinnity-gray/50"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
