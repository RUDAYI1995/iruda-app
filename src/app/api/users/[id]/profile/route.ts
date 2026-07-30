import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { levelFromExp, titleForLevel } from "@/lib/leveling";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "유저를 찾을 수 없어요" }, { status: 404 });
  }

  const [postCount, meetupCount, gameWinCount] = await Promise.all([
    prisma.post.count({ where: { authorId: id } }),
    prisma.meetupMember.count({ where: { userId: id } }),
    prisma.gameWinLog.count({ where: { userId: id } }),
  ]);

  const level = levelFromExp(user.exp);

  return NextResponse.json({
    userId: user.id,
    name: user.name,
    level,
    title: titleForLevel(level, user.gender ?? null),
    exp: user.exp,
    mileage: user.mileage,
    activity: {
      posts: postCount,
      meetupsJoined: meetupCount,
      gamesWon: gameWinCount,
    },
  });
}
