"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/use-auth";
import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";
import HeroSection from "@/components/landing/hero-section";
import HowItWorks from "@/components/landing/how-it-works";
import Testimonials from "@/components/landing/testimonials";
import WhyChooseTiffinity from "@/components/landing/why-choose-tifinnity";

export default function TiffinityLanding() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until auth context is hydrated

    if (user && profile?.role === "partner") {
      router.push("/partner/dashboard");
    }
  }, [user, profile, loading, router]);

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
