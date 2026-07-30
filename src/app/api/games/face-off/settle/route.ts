import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addExp, EXP_SOURCES } from "@/lib/leveling";
import { addMileage } from "@/lib/currency";

const TEAM_WIN_MILEAGE = 10000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { winningTeamUserIds } = await request.json();
  if (
    !Array.isArray(winningTeamUserIds) ||
    winningTeamUserIds.length === 0 ||
    !winningTeamUserIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json({ error: "승리 팀 멤버가 필요해요" }, { status: 400 });
  }

  const uniqueIds = Array.from(new Set(winningTeamUserIds)) as string[];

  await Promise.all(
    uniqueIds.map(async (userId) => {
      await addExp(userId, EXP_SOURCES.GAME_WIN);
      await addMileage(userId, TEAM_WIN_MILEAGE);
      await prisma.gameWinLog.create({ data: { userId, gameType: "FACE_OFF" } });
    })
  );

  return NextResponse.json({ ok: true, rewarded: uniqueIds.length });
}
