import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { endpoint } = await request.json();
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint가 필요해요" }, { status: 400 });
  }

  await prisma.pushSubscription
    .deleteMany({ where: { endpoint, userId: session.user.id } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
