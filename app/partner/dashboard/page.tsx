"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Optional: subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!user) return <p>Loading user...</p>;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
