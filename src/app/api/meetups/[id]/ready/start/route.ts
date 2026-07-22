import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const READY_WINDOW_MS = 30 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id: meetupId } = await params;

  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    include: { members: true, readyRoom: true },
  });
  if (!meetup) {
    return NextResponse.json({ error: "정모를 찾을 수 없어요" }, { status: 404 });
  }

  const isMember = meetup.members.some((m) => m.userId === session.user!.id);
  if (!isMember) {
    return NextResponse.json(
      { error: "이 정모의 참여자만 레디룸에 입장할 수 있어요" },
      { status: 403 }
    );
  }

  if (meetup.members.length < meetup.minSize) {
    return NextResponse.json(
      { error: `최소 ${meetup.minSize}명이 모여야 레디룸을 시작할 수 있어요` },
      { status: 409 }
    );
  }

  let readyRoom = meetup.readyRoom;

  if (!readyRoom) {
    readyRoom = await prisma.readyRoom.create({
      data: {
        meetupId,
        status: "READY_CHECK",
        expiresAt: new Date(Date.now() + READY_WINDOW_MS),
        participants: {
          create: meetup.members.map((m) => ({ userId: m.userId })),
        },
      },
    });
  } else if (readyRoom.status === "EXPIRED") {
    readyRoom = await prisma.readyRoom.update({
      where: { id: readyRoom.id },
      data: {
        status: "READY_CHECK",
        expiresAt: new Date(Date.now() + READY_WINDOW_MS),
      },
    });
    await prisma.readyRoomParticipant.updateMany({
      where: { readyRoomId: readyRoom.id },
      data: { readyAt: null },
    });
  }

  return NextResponse.json({ ok: true, readyRoomId: readyRoom.id });
}
