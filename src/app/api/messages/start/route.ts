import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { otherUserId } = await request.json();
  if (!otherUserId || otherUserId === session.user.id) {
    return NextResponse.json({ error: "상대방을 확인할 수 없어요" }, { status: 400 });
  }

  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser) {
    return NextResponse.json({ error: "상대 유저를 찾을 수 없어요" }, { status: 404 });
  }

  const [userAId, userBId] = [session.user.id, otherUserId].sort();

  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
  });

  return NextResponse.json({ conversationId: conversation.id });
}
