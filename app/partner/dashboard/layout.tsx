import Navbar from "@/components/partner/navbar";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "partner") redirect("/auth/login");

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </>
  );
}
