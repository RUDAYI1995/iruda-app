import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EVENTS, type EventKey } from "@/lib/events";

export async function POST(request: Request) {
  const session = await auth();
  const isOperator = Boolean((session?.user as { isOperator?: boolean } | undefined)?.isOperator);
  if (!session?.user?.id || !isOperator) {
    return NextResponse.json({ error: "운영자만 사용할 수 있어요" }, { status: 403 });
  }

  const { eventKey, userId, reason } = await request.json();
  if (!Object.keys(EVENTS).includes(eventKey)) {
    return NextResponse.json({ error: "존재하지 않는 이벤트예요" }, { status: 400 });
  }
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "userId가 필요해요" }, { status: 400 });
  }

  await prisma.eventDisqualification.upsert({
    where: { eventKey_userId: { eventKey: eventKey as EventKey, userId } },
    create: {
      eventKey,
      userId,
      reason: typeof reason === "string" ? reason : null,
      createdById: session.user.id,
    },
    update: { reason: typeof reason === "string" ? reason : null },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const isOperator = Boolean((session?.user as { isOperator?: boolean } | undefined)?.isOperator);
  if (!session?.user?.id || !isOperator) {
    return NextResponse.json({ error: "운영자만 사용할 수 있어요" }, { status: 403 });
  }

  const { eventKey, userId } = await request.json();
  await prisma.eventDisqualification
    .delete({ where: { eventKey_userId: { eventKey, userId } } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
