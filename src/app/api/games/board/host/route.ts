import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeGroupScore, type MatchableProfile } from "@/lib/matching/meetup";
import type { AxisScores } from "@/lib/matching/scoring";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { tileLabel, title, body } = await request.json();
  if (
    typeof tileLabel !== "string" ||
    typeof title !== "string" ||
    !title.trim() ||
    typeof body !== "string" ||
    !body.trim()
  ) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요" }, { status: 400 });
  }

  const myProfile = await prisma.personalityProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!myProfile) {
    return NextResponse.json({ error: "먼저 성향 테스트를 완료해주세요" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: { name: title.trim(), description: body.trim() },
  });

  const scheduledAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const meetup = await prisma.meetup.create({
    data: {
      activityId: activity.id,
      location: tileLabel,
      scheduledAt,
      minSize: 3,
      maxSize: 5,
    },
  });

  // 방장(작성자)은 첫 멤버로 자동 참여 — 아직 아무도 없으니 궁합 점수는 항상 통과
  const myMatchable: MatchableProfile = {
    broadCategory: myProfile.broadCategory,
    axisScores: myProfile.axisScores as AxisScores,
    interests: JSON.parse(myProfile.interests),
    pace: myProfile.pace,
    languages: JSON.parse(myProfile.languages),
    interestEmbedding: myProfile.interestEmbedding ? JSON.parse(myProfile.interestEmbedding) : null,
  };
  const matchScore = computeGroupScore(myMatchable, []);
  await prisma.meetupMember.create({
    data: { meetupId: meetup.id, userId: session.user.id, matchScore },
  });

  return NextResponse.json({ meetupId: meetup.id });
}
