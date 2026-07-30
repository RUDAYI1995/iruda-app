import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

function checkAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 시크릿 미설정 시(로컬 개발) 통과
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  if (!checkAuthorized(request)) {
    return NextResponse.json({ error: "인증이 필요해요" }, { status: 401 });
  }

  const due = await prisma.scheduledNotification.findMany({
    where: { sent: false, sendAt: { lte: new Date() } },
  });

  for (const n of due) {
    try {
      await sendPushToUser(n.userId, { title: n.title, body: n.body, url: "/home" });
    } catch (error) {
      console.error("예약 알림 발송 실패", n.id, error);
    }
    await prisma.scheduledNotification.update({ where: { id: n.id }, data: { sent: true } });
  }

  return NextResponse.json({ ok: true, sent: due.length });
}
