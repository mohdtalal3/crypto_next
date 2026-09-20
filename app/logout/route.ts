import { NextResponse } from "next/server";
import { expiredSessionCookie } from "@/lib/auth/session";

/** Compatibility route for the previous `/logout` link. */
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(expiredSessionCookie.name, expiredSessionCookie.value, expiredSessionCookie.options);
  return response;
}
