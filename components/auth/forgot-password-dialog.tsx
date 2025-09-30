"use client";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function ForgotPasswordDialog() {
  const [email, setEmail] = useState<string>("");

  const supabase = createClient();
  const sendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.auth.resetPasswordForEmail(email, {
          redirectTo : `${window.origin}/auth/reset-password`,});
      toast.success("Password reset link sent!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(msg);
      toast.error("Error sending password reset link");
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-sm text-tifinnity-green hover:bg-gray-200 hover:text-tifinnity-green"
        >
          Forgot password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email below and we&apos;ll send you a link to reset your
            password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="email">Username</Label>
            <Input
              id="email"
              type="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={sendResetEmail}>
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
