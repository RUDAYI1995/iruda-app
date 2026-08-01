import { prisma } from "@/lib/prisma";

// 루다투표제 부정투표 방지 기준 — 이 이상이면 참가자와 "친한 사이"로 보고 그 사람 판정에서 배제함
export const VOTE_EXCLUSION_THRESHOLD = 100;

export async function bumpCloseness(userIdA: string, userIdB: string, amount: number) {
  if (userIdA === userIdB) return;
  await prisma.closeness.upsert({
    where: { userId_otherId: { userId: userIdA, otherId: userIdB } },
    update: { score: { increment: amount } },
    create: { userId: userIdA, otherId: userIdB, score: amount },
  });
  await prisma.closeness.upsert({
    where: { userId_otherId: { userId: userIdB, otherId: userIdA } },
    update: { score: { increment: amount } },
    create: { userId: userIdB, otherId: userIdA, score: amount },
  });
}

export async function getCloseness(userIdA: string, userIdB: string): Promise<number> {
  if (userIdA === userIdB) return Infinity;
  const row = await prisma.closeness.findUnique({
    where: { userId_otherId: { userId: userIdA, otherId: userIdB } },
  });
  return row?.score ?? 0;
}

// voterId가 이 참가자 목록 중 누구에게든 너무 친하면(또는 본인이 참가자면) 투표 불가
export async function canVote(voterId: string, participantIds: string[]): Promise<boolean> {
  if (participantIds.includes(voterId)) return false;
  for (const p of participantIds) {
    const score = await getCloseness(voterId, p);
    if (score >= VOTE_EXCLUSION_THRESHOLD) return false;
  }
  return true;
}
