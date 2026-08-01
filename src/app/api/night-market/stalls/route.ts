import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isNightMarketOpen } from "@/lib/nightMarket";

export async function GET() {
  const open = isNightMarketOpen();
  if (!open) {
    return NextResponse.json({ open: false, stalls: [] });
  }

  const session = await auth();
  const stalls = await prisma.nightMarketStall.findMany({
    include: { owner: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    open: true,
    stalls: stalls.map((s) => ({
      id: s.id,
      ownerId: s.ownerId,
      ownerName: s.owner.name,
      name: s.name,
      emoji: s.emoji,
      description: s.description,
      isMine: s.ownerId === session?.user?.id,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  if (!isNightMarketOpen()) {
    return NextResponse.json(
      { error: "야시장은 대구시간 20:00~06:00에만 점포를 만들 수 있어요" },
      { status: 400 }
    );
  }

  const { name, emoji, description } = await request.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "점포 이름을 입력해주세요" }, { status: 400 });
  }
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "점포 소개를 입력해주세요" }, { status: 400 });
  }

  const stall = await prisma.nightMarketStall.upsert({
    where: { ownerId: session.user.id },
    create: {
      ownerId: session.user.id,
      name: name.trim(),
      emoji: typeof emoji === "string" && emoji.trim() ? emoji.trim() : "🏮",
      description: description.trim(),
    },
    update: {
      name: name.trim(),
      emoji: typeof emoji === "string" && emoji.trim() ? emoji.trim() : "🏮",
      description: description.trim(),
    },
  });

  return NextResponse.json({ ok: true, stall });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  await prisma.nightMarketStall.deleteMany({ where: { ownerId: session.user.id } });
  return NextResponse.json({ ok: true });
}
