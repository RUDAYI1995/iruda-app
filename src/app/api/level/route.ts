import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { levelProgress, titleForLevel } from "@/lib/leveling";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ loggedIn: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { exp: true, gender: true, mileage: true },
  });
  if (!user) return NextResponse.json({ loggedIn: false });

  const progress = levelProgress(user.exp);
  return NextResponse.json({
    loggedIn: true,
    ...progress,
    title: titleForLevel(progress.level, user.gender),
    needsGender: !user.gender,
    mileage: user.mileage,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { gender } = await request.json();
  if (gender !== "MALE" && gender !== "FEMALE") {
    return NextResponse.json({ error: "성별을 선택해주세요" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { gender },
  });

  return NextResponse.json({ ok: true });
}
