import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, createContext, useContext } from "react";

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError.message);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError.message);
      }

      setProfile(profileData ?? null);
      setLoading(false);
    };

    getUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
