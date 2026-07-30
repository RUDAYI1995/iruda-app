import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { targetUserId, sendAt, message } = await request.json();

  if (typeof targetUserId !== "string" || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "받는 사람과 메시지를 입력해주세요" }, { status: 400 });
  }
  const sendAtDate = new Date(sendAt);
  if (!sendAt || Number.isNaN(sendAtDate.getTime())) {
    return NextResponse.json({ error: "보낼 시각이 올바르지 않아요" }, { status: 400 });
  }

  const membership = await prisma.partyMember.findUnique({
    where: { userId: session.user.id },
    include: { party: true },
  });
  if (!membership || membership.party.leaderId !== session.user.id) {
    return NextResponse.json({ error: "파티장만 이 알림을 보낼 수 있어요" }, { status: 403 });
  }

  const targetMembership = await prisma.partyMember.findUnique({ where: { userId: targetUserId } });
  if (!targetMembership || targetMembership.partyId !== membership.partyId) {
    return NextResponse.json({ error: "같은 파티원에게만 보낼 수 있어요" }, { status: 400 });
  }

  const notification = await prisma.scheduledNotification.create({
    data: {
      userId: targetUserId,
      createdById: session.user.id,
      title: "📣 파티장의 알림",
      body: message.trim(),
      sendAt: sendAtDate,
    },
  });

  return NextResponse.json({ ok: true, id: notification.id, sendAt: notification.sendAt });
}
