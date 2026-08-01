import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MOOD_KEYS = ["sensitive", "shoo", "calm", "happy"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  const mood = await prisma.userMood.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json({ moodKey: mood?.moodKey ?? null });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  const { moodKey } = await request.json();
  if (typeof moodKey !== "string" || !MOOD_KEYS.includes(moodKey)) {
    return NextResponse.json({ error: "알 수 없는 컨디션이에요" }, { status: 400 });
  }
  await prisma.userMood.upsert({
    where: { userId: session.user.id },
    update: { moodKey },
    create: { userId: session.user.id, moodKey },
  });
  return NextResponse.json({ ok: true });
}
