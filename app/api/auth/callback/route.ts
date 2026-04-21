import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.user) {
      const { user } = data.session;
      const full_name =
        (user.user_metadata as Record<string, unknown>)?.full_name ?? "";
      const email = user.email ?? "";

      if (email) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            full_name: typeof full_name === "string" ? full_name : "",
            email,
            role: "subscriber",
          },
          { onConflict: "id" },
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
