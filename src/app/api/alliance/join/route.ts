import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ALLIANCE_CAUSES } from "@/lib/allianceCauses";

const JOIN_THRESHOLD = 100;

export async function GET(request: Request) {
  const session = await auth();
  const causeId = new URL(request.url).searchParams.get("causeId");
  const cause = ALLIANCE_CAUSES.find((c) => c.slug === causeId);
  if (!cause) {
    return NextResponse.json({ error: "알 수 없는 캠페인이에요" }, { status: 400 });
  }

  const count = await prisma.allianceJoin.count({ where: { causeId: cause.slug } });
  const joined = session?.user?.id
    ? !!(await prisma.allianceJoin.findUnique({
        where: { causeId_userId: { causeId: cause.slug, userId: session.user.id } },
      }))
    : false;

  return NextResponse.json({ count, joined, threshold: JOIN_THRESHOLD });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { causeId } = await request.json();
  const cause = ALLIANCE_CAUSES.find((c) => c.slug === causeId);
  if (!cause) {
    return NextResponse.json({ error: "알 수 없는 캠페인이에요" }, { status: 400 });
  }

  await prisma.allianceJoin.upsert({
    where: { causeId_userId: { causeId: cause.slug, userId: session.user.id } },
    update: {},
    create: { causeId: cause.slug, userId: session.user.id },
  });

  const count = await prisma.allianceJoin.count({ where: { causeId: cause.slug } });

  let voteId: string | null = null;
  if (count >= JOIN_THRESHOLD) {
    const existingVote = await prisma.rudaVote.findFirst({
      where: { kind: "REFERENDUM", contextJson: { path: ["causeId"], equals: cause.slug } },
    });
    if (existingVote) {
      voteId = existingVote.id;
    } else {
      const vote = await prisma.rudaVote.create({
        data: {
          kind: "REFERENDUM",
          label: `[국민투표제] ${cause.country} — ${cause.title}`,
          photoAUrl: cause.image,
          requesterId: session.user.id,
          contextJson: { causeId: cause.slug },
        },
      });
      voteId = vote.id;
    }
  }

  return NextResponse.json({ ok: true, count, threshold: JOIN_THRESHOLD, submittedVoteId: voteId });
}
