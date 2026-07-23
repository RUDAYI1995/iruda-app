import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  name: z.string().min(1),
  memberEmails: z.array(z.string().email()).default([]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const groups = await prisma.groupChat.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      memberCount: g.members.length,
      lastMessage: g.messages[0]?.body ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  }

  const invitees = await prisma.user.findMany({
    where: { email: { in: parsed.data.memberEmails } },
  });

  const memberIds = Array.from(new Set([session.user.id, ...invitees.map((u) => u.id)]));

  const group = await prisma.groupChat.create({
    data: {
      name: parsed.data.name,
      creatorId: session.user.id,
      members: { create: memberIds.map((userId) => ({ userId })) },
    },
  });

  return NextResponse.json({ ok: true, id: group.id });
}
