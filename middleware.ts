import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata.role;
  if (!user || !role) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  const pathname = req.nextUrl.pathname;

  // Role-based access control
  if (pathname.startsWith("/partner") && role !== "partner") {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=partner", req.url)
    );
  }

  if (pathname.startsWith("/customer") && role !== "student") {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=student", req.url)
    );
  }

  return res;
}

export const config = {
  matcher: ["/partner/:path*", "/customer/:path*"],
};
