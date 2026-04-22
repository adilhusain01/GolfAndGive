import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/subscribe",
  "/charities",
  "/api/auth/callback",
  "/api/payments/success",
  "/api/payments/webhook",
];
const ADMIN_PATHS = ["/admin"];
const MEMBER_PATHS = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookies: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>,
        ) {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicPath) {
    return response;
  }

  // Not logged in → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Admin-only routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (MEMBER_PATHS.some((p) => pathname.startsWith(p))) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasSubscriberAccess =
      subscription?.status === "active" ||
      (subscription?.status === "cancelled" &&
        !!subscription.current_period_end &&
        new Date(subscription.current_period_end).getTime() > Date.now());

    if (!hasSubscriberAccess) {
      return NextResponse.redirect(new URL("/subscribe", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
