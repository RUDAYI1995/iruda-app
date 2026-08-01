import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const notifications = await prisma.scheduledNotification.findMany({
    where: { userId: session.user.id, sent: true },
    include: { createdBy: true },
    orderBy: { sendAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      sendAt: n.sendAt,
      fromName: n.createdById === n.userId ? null : n.createdBy.name,
      items: n.items ?? [],
    })),
  });
}
