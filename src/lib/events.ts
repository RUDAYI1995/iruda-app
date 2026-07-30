import { prisma } from "@/lib/prisma";

export type EventKey = "MILEAGE" | "ADVENTURER" | "IMAGINATION" | "SAFETY" | "ACTING";

export const EVENTS: Record<EventKey, { title: string; description: string }> = {
  MILEAGE: {
    title: "마일리지 혜택",
    description: "가장 많은 젤리를 모은 유저 랭킹이에요.",
  },
  ADVENTURER: {
    title: "올해의 모험왕",
    description: "여행 인증(GPS 사진 인증)을 가장 많이 성공한 유저 랭킹이에요.",
  },
  IMAGINATION: {
    title: "여행 상상력 풍부상",
    description: "게시판에 글을 가장 많이 쓴 유저 랭킹이에요.",
  },
  SAFETY: {
    title: "안전체크단",
    description: "다른 여행자를 위해 여행 인증 지점을 가장 많이 등록한 유저 랭킹이에요.",
  },
  ACTING: {
    title: "이번달 최고의 연극상",
    description: "표정짓기 대결에서 가장 많이 승리한 유저 랭킹이에요.",
  },
};

const RANK_SIZE = 10;

async function disqualifiedUserIds(eventKey: EventKey): Promise<Set<string>> {
  const rows = await prisma.eventDisqualification.findMany({
    where: { eventKey },
    select: { userId: true },
  });
  return new Set(rows.map((r) => r.userId));
}

export interface RankEntry {
  userId: string;
  name: string;
  score: number;
}

async function rankMileage(): Promise<RankEntry[]> {
  const excluded = await disqualifiedUserIds("MILEAGE");
  const users = await prisma.user.findMany({
    where: { mileage: { gt: 0 } },
    orderBy: { mileage: "desc" },
    take: RANK_SIZE + excluded.size,
    select: { id: true, name: true, mileage: true },
  });
  return users
    .filter((u) => !excluded.has(u.id))
    .slice(0, RANK_SIZE)
    .map((u) => ({ userId: u.id, name: u.name, score: u.mileage }));
}

async function rankByGroupCount(
  eventKey: EventKey,
  groupBy: () => Promise<{ userId: string; _count: { _all: number } }[]>
): Promise<RankEntry[]> {
  const excluded = await disqualifiedUserIds(eventKey);
  const grouped = await groupBy();
  const filtered = grouped
    .filter((g) => !excluded.has(g.userId))
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, RANK_SIZE);

  if (filtered.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: filtered.map((f) => f.userId) } },
    select: { id: true, name: true },
  });
  const nameMap = new Map(users.map((u) => [u.id, u.name]));
  return filtered.map((f) => ({
    userId: f.userId,
    name: nameMap.get(f.userId) ?? "알 수 없음",
    score: f._count._all,
  }));
}

async function rankAdventurer(): Promise<RankEntry[]> {
  return rankByGroupCount("ADVENTURER", () =>
    prisma.questCheckpointVerification
      .groupBy({
        by: ["userId"],
        where: { verified: true },
        _count: { _all: true },
      })
      .then((rows) => rows.map((r) => ({ userId: r.userId, _count: r._count })))
  );
}

async function rankImagination(): Promise<RankEntry[]> {
  return rankByGroupCount("IMAGINATION", () =>
    prisma.post.groupBy({
      by: ["authorId"],
      _count: { _all: true },
    }).then((rows) => rows.map((r) => ({ userId: r.authorId, _count: r._count })))
  );
}

async function rankSafety(): Promise<RankEntry[]> {
  return rankByGroupCount("SAFETY", () =>
    prisma.questCheckpoint.groupBy({
      by: ["createdById"],
      _count: { _all: true },
    }).then((rows) => rows.map((r) => ({ userId: r.createdById, _count: r._count })))
  );
}

async function rankActing(): Promise<RankEntry[]> {
  return rankByGroupCount("ACTING", () =>
    prisma.gameWinLog
      .groupBy({
        by: ["userId"],
        where: { gameType: "FACE_OFF" },
        _count: { _all: true },
      })
      .then((rows) => rows.map((r) => ({ userId: r.userId, _count: r._count })))
  );
}

export async function getEventRanking(eventKey: EventKey): Promise<RankEntry[]> {
  switch (eventKey) {
    case "MILEAGE":
      return rankMileage();
    case "ADVENTURER":
      return rankAdventurer();
    case "IMAGINATION":
      return rankImagination();
    case "SAFETY":
      return rankSafety();
    case "ACTING":
      return rankActing();
  }
}
