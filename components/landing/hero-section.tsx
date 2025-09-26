import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex items-center justify-center h-screen px-4 py-12 md:px-6 md:py-24 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="text-tifinnity-orange">Home Cooked</span>
            <br />
            <span className="text-tifinnity-green">Delivered</span>
          </h2>
          <p className="text-tifinnity-gray text-base md:text-lg mb-6 md:mb-8">
            Your mess, your meal, your home away from home.
          </p>
          <Link href="/auth/signup/student">
            <Button className="bg-tifinnity-green hover:bg-tifinnity-green/90 text-white px-6 py-3 md:px-8 md:py-3 rounded-md transition-colors">
              Get Started
            </Button>
          </Link>
        </div>
        <div className="relative order-1 md:order-2">
          <Image
            src="/landing.jpg"
            alt="Person enjoying home-cooked meal"
            className="rounded-xl w-full object-cover aspect-[4/3] md:aspect-auto"
            width={600}
            height={400}
            priority
          />
        </div>
      </div>
    </section>
  );
}
