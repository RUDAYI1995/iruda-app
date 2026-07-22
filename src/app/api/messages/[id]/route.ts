import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function loadConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { userA: true, userB: true },
  });
  if (!conversation) return null;
  if (conversation.userAId !== userId && conversation.userBId !== userId) return null;
  return conversation;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await loadConversation(id, session.user.id);
  if (!conversation) {
    return NextResponse.json({ error: "대화를 찾을 수 없어요" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    include: { sender: true },
  });

  const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;

  return NextResponse.json({
    otherUserName: otherUser.name,
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      isMe: m.senderId === session.user!.id,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await loadConversation(id, session.user.id);
  if (!conversation) {
    return NextResponse.json({ error: "대화를 찾을 수 없어요" }, { status: 404 });
  }

  const { body } = await request.json();
  if (!body || typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "메시지 내용을 입력해주세요" }, { status: 400 });
  }

  await prisma.message.create({
    data: { conversationId: id, senderId: session.user.id, body: body.trim() },
  });

  return NextResponse.json({ ok: true });
}
