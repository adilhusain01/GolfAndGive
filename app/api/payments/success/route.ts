import { NextResponse, type NextRequest } from "next/server";

// DodoPayments return_url lands here after successful payment.
// The webhook will activate the subscription asynchronously.
// We just redirect the user to the dashboard with a success message.
export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname   = "/dashboard";
  url.search     = "?welcome=1";
  return NextResponse.redirect(url);
}
