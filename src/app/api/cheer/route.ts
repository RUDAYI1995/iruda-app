import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  await prisma.cheerClick.create({
    data: { userId: session?.user?.id ?? null },
  });

  return NextResponse.json({ ok: true });
}
