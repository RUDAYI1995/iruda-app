import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

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
    "/group-chats/:path*",
    "/meetups/:path*/ready",
    "/bookings/:path*",
    "/guides/apply",
  ],
};
