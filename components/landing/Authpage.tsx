'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "signup";
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  remember: boolean;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(mode === "login");
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
    remember: false
  });
  const supabase = createClient()
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[id as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id as keyof FormData];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Email validation (only required for login, optional for signup if phone is provided)
    if (isLogin && !formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = "Email or phone number is required";
    } else if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Phone validation (only required for signup if email is not provided)
    if (!isLogin && !formData.email.trim() && !formData.phone.trim()) {
      newErrors.phone = "Email or phone number is required";
    } else if (formData.phone.trim() && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Phone number is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async () => {
    try {
      let authResponse;
      
      if (formData.email) {
        // Login with email
        authResponse = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      } else if (formData.phone) {
        // For phone login, you might need to implement OTP flow
        // This is a placeholder - you'll need to adjust based on your auth strategy
        setMessage("Phone login is not yet implemented. Please use email.");
        setIsSuccess(false);
        setShowConfirmation(true);
        return;
      } else {
        throw new Error("Please provide email or phone number");
      }
      
      const { error } = authResponse;
      
      if (error) throw error;
      
      setIsSuccess(true);
      setMessage("You have successfully logged in!");
      setShowConfirmation(true);

      setTimeout(() => {
        router.push("/partner/dashboard");
      }, 2000);
      
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(error.message || "An error occurred during login");
      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
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
            role:'partner',
          },
        },
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      if (formData.email) {
        setMessage("Account created successfully! Please check your email to verify your account.");
      } else {
        setMessage("Account created successfully!");
      }
      setShowConfirmation(true);
      
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(error.message || "An error occurred during signup");
      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };
  
  const closeConfirmation = () => {
    setShowConfirmation(false);
    
    // Reset form on successful submission
    if (isSuccess) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        remember: false
      });
      
      // Redirect to login after successful signup
      if (!isLogin && isSuccess) {
        setIsLogin(true);
      }
    }
  };

  return (
    <>
      <section className="px-4 py-12 md:px-6 md:py-16 max-w-7xl mx-auto min-h-screen flex items-center">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full">
          <div className="order-2 md:order-1">
            <div className="max-w-md mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
                {isLogin ? (
                  <>
                    <span className="text-tifinnity-orange">Welcome</span>
                    <br />
                    <span className="text-tifinnity-green">Back</span>
                  </>
                ) : (
                  <>
                    <span className="text-tifinnity-orange">Join</span>
                    <br />
                    <span className="text-tifinnity-green">Tifinnity</span>
                  </>
                )}
              </h2>
              
              <p className="text-tifinnity-gray text-base md:text-lg mb-6 md:mb-8">
                {isLogin ? "Sign in to continue your culinary journey" : "Create an account to get started"}
              </p>
              
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-tifinnity-gray text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tifinnity-green/50 ${
                        errors.name ? 'border-red-500' : 'border-gray-200'
                      }`}
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-tifinnity-gray text-sm font-medium">
                    Email Address {!isLogin && <span className="text-gray-400">(optional)</span>}
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tifinnity-green/50 ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-tifinnity-gray text-sm font-medium">
                    Phone Number {!isLogin && <span className="text-gray-400">(optional)</span>}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tifinnity-green/50 ${
                      errors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  {!isLogin && (
                    <p className="text-xs text-tifinnity-gray">
                      Provide at least one: email or phone number
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-tifinnity-gray text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tifinnity-green/50 ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
                
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-tifinnity-gray text-sm font-medium">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tifinnity-green/50 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                      }`}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                  </div>
                )}
                
                {isLogin && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 text-tifinnity-green focus:ring-tifinnity-green border-gray-300 rounded"
                        checked={formData.remember}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-tifinnity-gray">
                        Remember me
                      </label>
                    </div>
                    
                    <Link href="/auth/forgot-password" className="text-sm text-tifinnity-green hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-tifinnity-green hover:bg-tifinnity-green/90 text-white py-3 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isLogin ? "Sign In" : "Create Account"
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-tifinnity-gray text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Link 
                    href={isLogin ? "/auth/signup" : "/auth/login"} 
                    className="text-tifinnity-green hover:underline font-medium"
                    onClick={(e) => {
                      if (isLoading) e.preventDefault();
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </Link>
                </p>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-tifinnity-gray">Or continue with</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" className="py-2 w-full max-w-xs" disabled={isLoading}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c极客时间 2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.极客时间16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.极客时间35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
              </div>
            </div>
          </div>
          
          <div className="relative order-1 md:order-2">
            <Image
              src="/landing.png"
              alt="Person enjoying home-cooked meal"
              className="rounded-xl w-full object-cover aspect-[4/3] md:aspect-auto"
              width={600}
              height={400}
              priority
            />
          </div>
        </div>
      </section>

      {/* Confirmation/Error Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p极客时间-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isSuccess ? 'bg-tifinnity-green/20' : 'bg-red-100'
              }`}>
                {isSuccess ? (
                  <svg className="w-8 h-8 text-tifinnity-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 极客时间0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>
            </div>
            
            <h3 className={`text-2xl font-bold text-center mb-2 ${
              isSuccess ? 'text-tifinnity-green' : 'text-red-600'
            }`}>
              {isSuccess ? (isLogin ? "Login Successful!" : "Account Created!") : "Error"}
            </h3>
            
            <p className="text-tifinnity-gray text-center mb-6">
              {message}
            </p>
            
            <div className="flex justify-center">
              <Button 
                onClick={closeConfirmation}
                className={`${
                  isSuccess 
                    ? 'bg-tifinnity-green hover:bg-tifinnity-green/90' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white px-6 py-2 rounded-md`}
              >
                {isSuccess ? (isLogin ? "Continue" : "Okay") : "Try Again"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}