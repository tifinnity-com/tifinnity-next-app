import Navbar from "@/components/partner/navbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = user?.user_metadata.role;
  if (role !== "partner") redirect("/auth/login");

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </>
  );
}
