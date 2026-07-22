import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeCompanionScore } from "@/lib/matching/animalCompanion";
import type { AxisScores } from "@/lib/matching/scoring";

const Schema = z.object({
  soloTravel: z.boolean(),
  soloRental: z.boolean(),
  groupTravel: z.boolean(),
  groupRental: z.boolean(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const [mine, myProfile] = await Promise.all([
    prisma.animalCompanionRequest.findUnique({ where: { userId: session.user.id } }),
    prisma.personalityProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  let matches: {
    userId: string;
    name: string;
    needsRental: boolean;
    score: number;
  }[] = [];

  if (mine?.groupTravel) {
    const others = await prisma.animalCompanionRequest.findMany({
      where: { groupTravel: true, userId: { not: session.user.id } },
      include: { user: { include: { personalityProfile: true } } },
    });

    const myCandidate = myProfile
      ? {
          axisScores: myProfile.axisScores as AxisScores,
          interests: JSON.parse(myProfile.interests) as string[],
        }
      : {};

    matches = others
      .map((o) => {
        const otherCandidate = o.user.personalityProfile
          ? {
              axisScores: o.user.personalityProfile.axisScores as AxisScores,
              interests: JSON.parse(o.user.personalityProfile.interests) as string[],
            }
          : {};
        return {
          userId: o.userId,
          name: o.user.name,
          needsRental: o.groupRental,
          score: computeCompanionScore(myCandidate, otherCandidate),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  return NextResponse.json({
    request: mine
      ? {
          soloTravel: mine.soloTravel,
          soloRental: mine.soloRental,
          groupTravel: mine.groupTravel,
          groupRental: mine.groupRental,
        }
      : null,
    matches,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  }

  await prisma.animalCompanionRequest.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
