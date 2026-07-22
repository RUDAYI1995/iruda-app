import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id: meetupId } = await params;

  const readyRoom = await prisma.readyRoom.findUnique({
    where: { meetupId },
    include: { participants: { include: { user: true } } },
  });

  if (!readyRoom) {
    return NextResponse.json({ error: "레디룸이 아직 시작되지 않았어요" }, { status: 404 });
  }

  const now = Date.now();
  const expired = now > readyRoom.expiresAt.getTime();
  const allReady = readyRoom.participants.every((p) => p.readyAt !== null);

  let status = readyRoom.status;

  if (status === "READY_CHECK" && allReady) {
    status = "CONFIRMED";
    await prisma.readyRoom.update({
      where: { id: readyRoom.id },
      data: { status: "CONFIRMED" },
    });
  } else if (status === "READY_CHECK" && expired) {
    status = "EXPIRED";
    await prisma.readyRoom.update({
      where: { id: readyRoom.id },
      data: { status: "EXPIRED" },
    });
  }

  return NextResponse.json({
    status,
    expiresAt: readyRoom.expiresAt,
    participants: readyRoom.participants.map((p) => ({
      userId: p.userId,
      name: p.user.name,
      ready: p.readyAt !== null,
      isMe: p.userId === session.user!.id,
    })),
  });
}
