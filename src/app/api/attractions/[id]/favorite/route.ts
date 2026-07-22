import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.attractionFavorite.findUnique({
    where: { attractionId_userId: { attractionId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.attractionFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, isFavorite: false });
  }

  await prisma.attractionFavorite.create({
    data: { attractionId: id, userId: session.user.id },
  });
  return NextResponse.json({ ok: true, isFavorite: true });
}
