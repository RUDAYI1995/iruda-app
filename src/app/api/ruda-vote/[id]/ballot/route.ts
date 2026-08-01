import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canVote } from "@/lib/closeness";
import { addExp, EXP_SOURCES } from "@/lib/leveling";
import { addMileage } from "@/lib/currency";
import { DUNGEON_CLEAR_MILEAGE } from "@/lib/assaDungeon";

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

const VOTE_THRESHOLD = 3; // 이 수만큼 투표가 모이면 다수결로 즉시 확정

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  const { id } = await params;
  const { choice } = await request.json();
  if (typeof choice !== "string" || !choice) {
    return NextResponse.json({ error: "선택값이 없어요" }, { status: 400 });
  }

  const vote = await prisma.rudaVote.findUnique({ where: { id }, include: { ballots: true } });
  if (!vote || vote.status !== "OPEN") {
    return NextResponse.json({ error: "이미 종료된 투표예요" }, { status: 400 });
  }

  const participants = participantsOf(vote);
  const allowed = await canVote(session.user.id, participants);
  if (!allowed) {
    return NextResponse.json(
      { error: "이 투표는 참가자거나 참가자와 친한 사이라서 투표할 수 없어요" },
      { status: 403 }
    );
  }

  await prisma.rudaVoteBallot.upsert({
    where: { voteId_voterId: { voteId: id, voterId: session.user.id } },
    update: { choice },
    create: { voteId: id, voterId: session.user.id, choice },
  });

  const ballots = await prisma.rudaVoteBallot.findMany({ where: { voteId: id } });
  if (ballots.length < VOTE_THRESHOLD) {
    return NextResponse.json({ status: "OPEN", totalVotes: ballots.length });
  }

  const tally = ballots.reduce<Record<string, number>>((acc, b) => {
    acc[b.choice] = (acc[b.choice] ?? 0) + 1;
    return acc;
  }, {});
  const context = vote.contextJson as Record<string, unknown>;

  if (vote.kind === "MISSION") {
    const approve = tally.APPROVE ?? 0;
    const reject = tally.REJECT ?? 0;
    const approved = approve > reject;
    if (approved) {
      if (typeof context.zoneSlug === "string") {
        await prisma.adventureMissionProgress.upsert({
          where: {
            userId_zoneSlug_missionIndex: {
              userId: vote.requesterId,
              zoneSlug: context.zoneSlug as string,
              missionIndex: context.missionIndex as number,
            },
          },
          update: { count: { increment: 1 } },
          create: {
            userId: vote.requesterId,
            zoneSlug: context.zoneSlug as string,
            missionIndex: context.missionIndex as number,
            count: 1,
          },
        });
      } else if (typeof context.stageIndex === "number") {
        const stageIndex = context.stageIndex as number;
        const already = await prisma.dungeonStageProgress.findUnique({
          where: { userId_stageIndex: { userId: vote.requesterId, stageIndex } },
        });
        if (!already) {
          await prisma.dungeonStageProgress.create({
            data: { userId: vote.requesterId, stageIndex },
          });
          await addMileage(vote.requesterId, DUNGEON_CLEAR_MILEAGE);
          await addExp(vote.requesterId, EXP_SOURCES.MISSION);
        }
      }
    }
    await prisma.rudaVote.update({
      where: { id },
      data: { status: approved ? "APPROVED" : "REJECTED", resolvedAt: new Date() },
    });
    return NextResponse.json({ status: approved ? "APPROVED" : "REJECTED", totalVotes: ballots.length });
  }

  // FACE_OFF
  const votesA = tally.A ?? 0;
  const votesB = tally.B ?? 0;
  const winner = votesA >= votesB ? "A" : "B";
  const winningTeamUserIds = (context[winner === "A" ? "teamAUserIds" : "teamBUserIds"] ?? []) as string[];

  if (winningTeamUserIds.length > 0) {
    try {
      await fetch(new URL("/api/games/face-off/settle", request.url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ winningTeamUserIds }),
      });
    } catch (error) {
      console.error("face-off 자동 정산 실패", error);
    }
  }

  await prisma.rudaVote.update({
    where: { id },
    data: { status: "APPROVED", resolvedAt: new Date() },
  });
  return NextResponse.json({ status: "APPROVED", winner, totalVotes: ballots.length });
}
