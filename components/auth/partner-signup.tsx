"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useState, ChangeEvent, FormEvent } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { GoogleIcon } from "../ui/google-icon";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function PartnerSignupForm() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const supabase = createClient();

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id as keyof FormData];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
            role: "partner",
          },
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage(
        "Account created! Please check your email to verify your account."
      );
      setShowConfirmation(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during signup";
      setIsSuccess(false);
      setMessage(message);
      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    await handleSignup();
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    if (isSuccess) {
      // Redirect or clear form
      router.push("/auth/login");
    }
  };

  return (
    <section className="px-4 py-12 md:px-6 md:py-16 max-w-7xl mx-auto min-h-screen flex items-center">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full">
        <div className="order-2 md:order-1">
          <div className="max-w-md mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
              <span className="text-tifinnity-orange">Join</span>
              <br />
              <span className="text-tifinnity-green">Tifinnity</span>
            </h2>
            <p className="text-tifinnity-gray text-base md:text-lg mb-6 md:mb-8">
              Create a partner account to get started
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-tifinnity-gray text-sm font-medium"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className={`focus-visible:ring-tifinnity-green/50 ${
                    errors.name
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200"
                  }`}
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-tifinnity-gray text-sm font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`focus-visible:ring-tifinnity-green/50 ${
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200"
                  }`}
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-tifinnity-gray text-sm font-medium"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className={`focus-visible:ring-tifinnity-green/50 ${
                    errors.phone
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200"
                  }`}
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-tifinnity-gray text-sm font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className={`focus-visible:ring-tifinnity-green/50 ${
                    errors.password
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200"
                  }`}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-tifinnity-gray text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className={`focus-visible:ring-tifinnity-green/50 ${
                    errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200"
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-tifinnity-green hover:bg-tifinnity-green/90 text-white py-3 h-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-tifinnity-gray text-sm">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-tifinnity-green hover:underline font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-tifinnity-gray">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                className="py-2 h-auto w-full max-w-xs"
                disabled={isLoading}
              >
                <GoogleIcon className="w-5 h-5 mr-2" />
                Google
              </Button>
            </div>
          </div>
        </div>

        <div className="relative order-1 md:order-2">
          <Image
            src="/landing.jpeg"
            alt="Person enjoying home-cooked meal"
            className="rounded-xl w-full object-cover aspect-[4/3] md:aspect-auto"
            width={600}
            height={400}
          />
        </div>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              {isSuccess ? (
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-tifinnity-green/20">
                  <CheckCircle2 className="w-8 h-8 text-tifinnity-green" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              )}
            </div>
            <AlertDialogTitle
              className={`text-2xl font-bold text-center ${
                isSuccess ? "text-tifinnity-green" : "text-red-600"
              }`}
            >
              {isSuccess ? "Account Created!" : "Error"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-tifinnity-gray text-center">
              {message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex justify-center w-full">
              <AlertDialogAction
                onClick={closeConfirmation}
                className={`${
                  isSuccess
                    ? "bg-tifinnity-green hover:bg-tifinnity-green/90"
                    : "bg-red-500 hover:bg-red-600"
                } text-white px-6`}
              >
                {isSuccess ? "Okay" : "Try Again"}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
