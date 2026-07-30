import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const notifications = await prisma.scheduledNotification.findMany({
    where: { userId: session.user.id, sent: false },
    orderBy: { sendAt: "asc" },
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      sendAt: n.sendAt,
      isSelf: n.createdById === session.user!.id,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { sendAt, message } = await request.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "알림 내용을 입력해주세요" }, { status: 400 });
  }
  const sendAtDate = new Date(sendAt);
  if (!sendAt || Number.isNaN(sendAtDate.getTime())) {
    return NextResponse.json({ error: "알림 시각이 올바르지 않아요" }, { status: 400 });
  }

  const notification = await prisma.scheduledNotification.create({
    data: {
      userId: session.user.id,
      createdById: session.user.id,
      title: "⏰ 내 알림",
      body: message.trim(),
      sendAt: sendAtDate,
    },
  });

  return NextResponse.json({ ok: true, id: notification.id });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id } = await request.json();
  if (typeof id !== "string") {
    return NextResponse.json({ error: "id가 필요해요" }, { status: 400 });
  }

  await prisma.scheduledNotification.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
