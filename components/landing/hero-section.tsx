import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <Video />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/15 z-10" />

      {/* Content */}
      <div className="relative z-20 flex items-center justify-center h-full px-4 py-12 md:px-6 md:py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1 text-white">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-tifinnity-orange">Home Cooked</span>
              <br />
              <span className="text-tifinnity-green">Delivered</span>
            </h2>
            <p className="text-tifinnity-gray md:text-lg mb-6 md:mb-8 drop-shadow">
              Your mess, your meal, your home away from home.
            </p>
            <Link href="/auth/signup/student">
              <Button className="bg-tifinnity-green hover:bg-tifinnity-green/90 text-white px-6 py-3 md:px-8 md:py-3 rounded-md transition-colors">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="relative order-1 md:order-2">
            {/* Optional image or illustration */}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Video() {
  return (
    <video
      className="absolute inset-0 w-full h-full object-cover z-0 opacity-56"
      autoPlay
      loop
      muted
      playsInline
    >
      <source src="/tiffinn.mp4" type="video/mp4" />
    </video>
  );
}
