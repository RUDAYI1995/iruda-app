import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/matches/:path*",
    "/messages/:path*",
    "/meetups/:path*/ready",
    "/bookings/:path*",
    "/guides/apply",
  ],
};
