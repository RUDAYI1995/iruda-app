import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canVote } from "@/lib/closeness";

function participantsOf(vote: { kind: string; requesterId: string; contextJson: unknown }): string[] {
  if (vote.kind === "FACE_OFF") {
    const context = vote.contextJson as Record<string, unknown>;
    return [
      ...((context.teamAUserIds as string[] | undefined) ?? []),
      ...((context.teamBUserIds as string[] | undefined) ?? []),
    ];
  }
  return [vote.requesterId];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const votes = await prisma.rudaVote.findMany({
    where: { status: "OPEN" },
    include: { ballots: true },
    orderBy: { createdAt: "desc" },
  });

  const myUserId = session.user.id;
  const eligible = await Promise.all(
    votes.map(async (v) => ({ v, allowed: await canVote(myUserId, participantsOf(v)) }))
  );

  return NextResponse.json({
    votes: eligible
      .filter((e) => e.allowed)
      .map(({ v }) => ({
        id: v.id,
        kind: v.kind,
        label: v.label,
        photoAUrl: v.photoAUrl,
        photoBUrl: v.photoBUrl,
        createdAt: v.createdAt,
        myBallot: v.ballots.find((b) => b.voterId === session.user!.id)?.choice ?? null,
        tally: v.ballots.reduce<Record<string, number>>((acc, b) => {
          acc[b.choice] = (acc[b.choice] ?? 0) + 1;
          return acc;
        }, {}),
        totalVotes: v.ballots.length,
      })),
  });
}
