import AppHeader from "@/components/customer/app-header";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at) redirect("/auth/login");
  const role = user?.user_metadata.role;

  if (role !== "student") redirect("/auth/login");

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}