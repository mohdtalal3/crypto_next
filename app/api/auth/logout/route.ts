import { NextResponse } from "next/server";
import { expiredSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(expiredSessionCookie.name, expiredSessionCookie.value, expiredSessionCookie.options);
  return response;
}
