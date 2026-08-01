import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { teamNameA, teamNameB, photoA, photoB, teamAUserIds, teamBUserIds } = await request.json();
  if (
    typeof photoA !== "string" ||
    typeof photoB !== "string" ||
    !Array.isArray(teamAUserIds) ||
    !Array.isArray(teamBUserIds) ||
    teamAUserIds.length === 0 ||
    teamBUserIds.length === 0
  ) {
    return NextResponse.json({ error: "양 팀 사진과 팀원이 모두 필요해요" }, { status: 400 });
  }

  const vote = await prisma.rudaVote.create({
    data: {
      kind: "FACE_OFF",
      label: `표정짓기: ${teamNameA ?? "A팀"} vs ${teamNameB ?? "B팀"}`,
      photoAUrl: photoA,
      photoBUrl: photoB,
      requesterId: session.user.id,
      contextJson: { teamAUserIds, teamBUserIds },
    },
  });

  return NextResponse.json({ voteId: vote.id });
}
