import { prisma } from "@/lib/prisma";

export const MAX_LEVEL = 70;

export const EXP_SOURCES = {
  BOARD_POST: 0.3,
  GAME_WIN: 0.2,
  MISSION: 0.4,
  VISIT_DOMESTIC: 10,
  VISIT_OVERSEAS: 25,
} as const;

// 다음 레벨까지 필요한 EXP = 현재 레벨 × 100 (누진)
function expToReachLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += l * 100;
  return total;
}

export function levelFromExp(exp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && exp >= expToReachLevel(level + 1)) {
    level++;
  }
  return level;
}

export function levelProgress(exp: number) {
  const level = levelFromExp(exp);
  const currentFloor = expToReachLevel(level);
  const nextFloor = level >= MAX_LEVEL ? currentFloor : expToReachLevel(level + 1);
  const span = nextFloor - currentFloor;
  const into = exp - currentFloor;
  return {
    level,
    exp,
    currentFloor,
    nextFloor,
    ratio: span > 0 ? Math.min(1, into / span) : 1,
  };
}

const TIER_TITLES: Record<number, string> = {
  10: "빛을본자",
  20: "동네마실냥이",
  30: "터줏대감",
  40: "도지사냥이",
  50: "국내마스터",
  60: "해외바람둥이",
  70: "해외마스터",
};

export function titleForLevel(level: number, gender: "MALE" | "FEMALE" | "LGBTQ" | null): string {
  if (level < 10) {
    const base = gender === "FEMALE" ? "집순이" : "집돌이";
    return level === 1 ? base : `${base} Lv.${level}`;
  }

  const tier = Math.floor(level / 10) * 10;
  const base = TIER_TITLES[tier] ?? TIER_TITLES[10];
  return level === tier ? base : `${base} Lv.${level}`;
}

export async function addExp(userId: string, amount: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { exp: { increment: amount } },
  });
}
