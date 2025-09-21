import Navbar from "@/components/partner/navbar";
import { createClient } from "@/utils/supabase/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user?.id)
    .single();

  // if (profile?.role !== "partner") redirect("/login");
  console.log(user);
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
