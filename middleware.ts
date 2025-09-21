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
    data: { session },
  } = await supabase.auth.getSession();

  const role = session?.user?.user_metadata?.role;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/partner") && role !== "partner") {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=partner", req.url)
    );
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=admin", req.url)
    );
  }

  if (pathname.startsWith("/user") && !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/partner/:path*", "/admin/:path*", "/user/:path*"],
};
