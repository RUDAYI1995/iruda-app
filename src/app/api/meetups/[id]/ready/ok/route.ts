import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
  });
  if (!readyRoom) {
    return NextResponse.json({ error: "레디룸이 아직 시작되지 않았어요" }, { status: 404 });
  }

  if (readyRoom.status !== "READY_CHECK") {
    return NextResponse.json(
      { error: "지금은 OK를 누를 수 있는 상태가 아니에요" },
      { status: 409 }
    );
  }

  if (Date.now() > readyRoom.expiresAt.getTime()) {
    return NextResponse.json({ error: "레디룸 시간이 만료됐어요" }, { status: 409 });
  }

  await prisma.readyRoomParticipant.update({
    where: {
      readyRoomId_userId: { readyRoomId: readyRoom.id, userId: session.user.id },
    },
    data: { readyAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
