import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { levelFromExp, titleForLevel } from "@/lib/leveling";
import { getCloseness } from "@/lib/closeness";
import { MOODS } from "@/lib/moods";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "유저를 찾을 수 없어요" }, { status: 404 });
  }

  const [postCount, meetupCount, gameWinCount, mood, animalCompanion, closeness] = await Promise.all([
    prisma.post.count({ where: { authorId: id } }),
    prisma.meetupMember.count({ where: { userId: id } }),
    prisma.gameWinLog.count({ where: { userId: id } }),
    prisma.userMood.findUnique({ where: { userId: id } }),
    prisma.animalCompanionRequest.findUnique({ where: { userId: id } }),
    session?.user?.id ? getCloseness(session.user.id, id) : Promise.resolve(0),
  ]);

  const level = levelFromExp(user.exp);
  const moodInfo = MOODS.find((m) => m.key === mood?.moodKey) ?? null;

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
    mood: moodInfo ? { emoji: moodInfo.emoji, label: moodInfo.label } : null,
    animalCompanion: animalCompanion
      ? {
          soloTravel: animalCompanion.soloTravel,
          soloRental: animalCompanion.soloRental,
          groupTravel: animalCompanion.groupTravel,
          groupRental: animalCompanion.groupRental,
        }
      : null,
    closeness: session?.user?.id === id ? null : Number.isFinite(closeness) ? closeness : 0,
  });
}
