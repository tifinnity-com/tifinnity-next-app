"use client";

import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";
import HeroSection from "@/components/landing/hero-section";
import HowItWorks from "@/components/landing/how-it-works";
import Testimonials from "@/components/landing/testimonials";
import WhyChooseTiffinity from "@/components/landing/why-choose-tifinnity";

export default function TiffinityLanding() {
  return (
    <div className="min-h-screen bg-tifinnity-cream">
      <Header />
      <HeroSection />
      <HowItWorks />
      <WhyChooseTiffinity />
      <Testimonials />
      <Footer />
    </div>
  );
}
