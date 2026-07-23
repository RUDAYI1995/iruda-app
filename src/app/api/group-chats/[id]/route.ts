import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const Schema = z.object({ body: z.string().min(1) });

async function requireMembership(groupChatId: string, userId: string) {
  const membership = await prisma.groupChatMember.findUnique({
    where: { groupChatId_userId: { groupChatId, userId } },
  });
  return !!membership;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const { id } = await params;

  const isMember = await requireMembership(id, session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "참여 중인 그룹채팅이 아니에요." }, { status: 403 });
  }

  const group = await prisma.groupChat.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!group) {
    return NextResponse.json({ error: "그룹채팅을 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json({
    name: group.name,
    members: group.members.map((m) => ({
      name: m.user.name,
      isOperator: m.user.isOperator,
    })),
    messages: group.messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderName: m.sender.name,
      isOperator: m.sender.isOperator,
      isMe: m.senderId === session.user!.id,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const { id } = await params;

  const isMember = await requireMembership(id, session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "참여 중인 그룹채팅이 아니에요." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  await prisma.groupMessage.create({
    data: {
      groupChatId: id,
      senderId: session.user.id,
      body: parsed.data.body.trim(),
    },
  });

  return NextResponse.json({ ok: true });
}
