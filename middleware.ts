import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
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
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  const pathname = request.nextUrl.pathname;

  // Role-based access control
  if (pathname.startsWith("/partner") && role !== "partner") {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=partner", request.url)
    );
  }

  if (pathname.startsWith("/customer") && role !== "student") {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=student", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: ["/partner/:path*", "/customer/:path*"],
};