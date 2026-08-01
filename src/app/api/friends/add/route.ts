import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bumpCloseness } from "@/lib/closeness";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { targetUserId } = await request.json();
  if (typeof targetUserId !== "string") {
    return NextResponse.json({ error: "targetUserId가 필요해요" }, { status: 400 });
  }
  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "자기 자신은 추가할 수 없어요" }, { status: 400 });
  }

  await prisma.friendship.upsert({
    where: { userId_friendId: { userId: session.user.id, friendId: targetUserId } },
    create: { userId: session.user.id, friendId: targetUserId },
    update: {},
  });
  await prisma.friendship.upsert({
    where: { userId_friendId: { userId: targetUserId, friendId: session.user.id } },
    create: { userId: targetUserId, friendId: session.user.id },
    update: {},
  });

  await bumpCloseness(session.user.id, targetUserId, 30);

  return NextResponse.json({ ok: true });
}
