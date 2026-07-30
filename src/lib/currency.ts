import { prisma } from "@/lib/prisma";

export const MILEAGE_SOURCES = {
  BOARD_POST: 3,
  GAME_WIN: 2,
  MISSION: 4,
  VISIT_DOMESTIC: 100,
  VISIT_OVERSEAS: 250,
} as const;

export type DenominationKind = "coin" | "bill";

export interface Denomination {
  value: number;
  name: string;
  kind: DenominationKind;
  emoji: string; // 고양이 표정
}

// 값이 큰 순서 — 잔돈 계산에도 그대로 사용
export const DENOMINATIONS: Denomination[] = [
  { value: 100000, name: "닝겐", kind: "bill", emoji: "🐈‍⬛🎩" },
  { value: 10000, name: "집사의손길", kind: "bill", emoji: "🐈🧤" },
  { value: 1000, name: "참치캔", kind: "bill", emoji: "🐱🥫" },
  { value: 100, name: "캣닢", kind: "coin", emoji: "😽" },
  { value: 10, name: "츄르", kind: "coin", emoji: "😻" },
  { value: 1, name: "젤리", kind: "coin", emoji: "🐾" },
];

export function breakdownMileage(total: number) {
  let remaining = Math.max(0, Math.floor(total));
  return DENOMINATIONS.map((d) => {
    const count = Math.floor(remaining / d.value);
    remaining -= count * d.value;
    return { ...d, count };
  });
}

export async function addMileage(userId: string, amount: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { mileage: { increment: amount } },
  });
}

// 상점 등에서 잔액을 차감할 때 사용 — 잔액 부족이면 false
export async function spendMileage(userId: string, amount: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { mileage: true } });
  if (!user || user.mileage < amount) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { mileage: { decrement: amount } },
  });
  return true;
}
