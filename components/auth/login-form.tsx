"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";

// Simplified FormData for the login form
interface FormData {
  email: string;
  password: string;
  remember?: boolean;
}

export function LoginForm() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    remember: false,
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

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    setFormData((prev) => ({
      ...prev,
      remember: !!checked,
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      setIsSuccess(true);
      setMessage("You have successfully logged in!");
      setShowConfirmation(true);

      // Note: `data.user.role` is not a standard Supabase property.
      // This assumes you are using custom claims or metadata.
      if (data.user?.user_metadata?.role === "partner") {
        router.push("/partner/dashboard");
      } else {
        router.push("/customer/messes");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      setIsSuccess(false);
      setMessage(message || "An error occurred during login");
      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    await handleLogin();
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    if (isSuccess) {
      setFormData({
        email: "",
        password: "",
        remember: false,
      });
    }
  };

  return (
    <section className="px-4 py-12 md:px-6 md:py-16 max-w-7xl mx-auto min-h-screen flex items-center">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full">
        <div className="order-2 md:order-1">
          <div className="max-w-md mx-auto">
            <Image
              className="w-auto h-24 object-cover"
              src="/logo.png"
              alt="logo"
              width={600}
              height={400}
            />
            <h2 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
              <span className="text-tifinnity-orange">Welcome</span>
              <br />
              <span className="text-tifinnity-green">Back</span>
            </h2>
            <p className="text-tifinnity-gray text-base md:text-lg mb-6 md:mb-8">
              Sign in to continue your culinary journey
            </p>

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
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
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
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
                  placeholder="Enter your password"
                  className={`focus-visible:ring-tifinnity-green/50 ${
                    errors.password
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200"
                  }`}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Checkbox
                    id="remember"
                    className="data-[state=checked]:bg-tifinnity-green data-[state=checked]:border-tifinnity-green focus-visible:ring-tifinnity-green/50"
                    checked={formData.remember}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-tifinnity-gray font-normal"
                  >
                    Remember me
                  </Label>
                </div>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-tifinnity-green hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-tifinnity-green hover:bg-tifinnity-green/90 text-white py-3 h-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Processing...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-tifinnity-gray text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup/student"
                  className="text-tifinnity-green hover:underline font-medium"
                >
                  Sign up
                </Link>
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
            src="/landing.jpg"
            alt="Person enjoying home-cooked meal"
            className="rounded-xl w-full object-cover aspect-[4/3] md:aspect-auto"
            width={600}
            height={400}
            priority
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
              {isSuccess ? "Login Successful!" : "Error"}
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
                {isSuccess ? "Continue" : "Try Again"}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
