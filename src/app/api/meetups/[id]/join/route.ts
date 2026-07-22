import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeGroupScore, MIN_GROUP_SCORE, type MatchableProfile } from "@/lib/matching/meetup";
import type { AxisScores } from "@/lib/matching/scoring";

function toMatchable(profile: {
  broadCategory: string;
  axisScores: unknown;
  interests: string;
  pace: string;
  languages: string;
  interestEmbedding: string | null;
}): MatchableProfile {
  return {
    broadCategory: profile.broadCategory,
    axisScores: profile.axisScores as AxisScores,
    interests: JSON.parse(profile.interests),
    pace: profile.pace,
    languages: JSON.parse(profile.languages),
    interestEmbedding: profile.interestEmbedding ? JSON.parse(profile.interestEmbedding) : null,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id: meetupId } = await params;

  const myProfile = await prisma.personalityProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!myProfile) {
    return NextResponse.json(
      { error: "먼저 성향 테스트를 완료해주세요" },
      { status: 400 }
    );
  }

  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    include: { members: { include: { user: { include: { personalityProfile: true } } } } },
  });
  if (!meetup) {
    return NextResponse.json({ error: "정모를 찾을 수 없어요" }, { status: 404 });
  }

  if (meetup.members.some((m) => m.userId === session.user!.id)) {
    return NextResponse.json({ error: "이미 참여 중인 정모예요" }, { status: 409 });
  }

  if (meetup.members.length >= meetup.maxSize) {
    return NextResponse.json({ error: "정원이 다 찼어요" }, { status: 409 });
  }

  const existingProfiles = meetup.members
    .map((m) => m.user.personalityProfile)
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (
    existingProfiles.length > 0 &&
    existingProfiles[0].broadCategory !== myProfile.broadCategory
  ) {
    return NextResponse.json(
      { error: "이 정모는 나와 다른 대분류 유형끼리 모인 그룹이에요" },
      { status: 409 }
    );
  }

  const groupScore = computeGroupScore(
    toMatchable(myProfile),
    existingProfiles.map(toMatchable)
  );

  if (existingProfiles.length > 0 && groupScore < MIN_GROUP_SCORE) {
    return NextResponse.json(
      {
        error: `성향 궁합 점수(${Math.round(groupScore)}점)가 기준(${MIN_GROUP_SCORE}점) 미만이라 참여할 수 없어요`,
      },
      { status: 409 }
    );
  }

  await prisma.meetupMember.create({
    data: {
      meetupId,
      userId: session.user.id,
      matchScore: groupScore,
    },
  });

  return NextResponse.json({ ok: true, matchScore: Math.round(groupScore) });
}
