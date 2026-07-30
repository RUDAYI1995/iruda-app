import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { spendMileage } from "@/lib/currency";
import { getShopItem } from "@/lib/shopItems";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { itemId } = await request.json();
  const item = typeof itemId === "string" ? getShopItem(itemId) : undefined;
  if (!item) {
    return NextResponse.json({ error: "존재하지 않는 아이템이에요" }, { status: 404 });
  }

  const paid = await spendMileage(session.user.id, item.price);
  if (!paid) {
    return NextResponse.json({ error: "젤리가 부족해요" }, { status: 400 });
  }

  await prisma.inventoryItem.upsert({
    where: { userId_itemId: { userId: session.user.id, itemId: item.id } },
    create: { userId: session.user.id, itemId: item.id, quantity: 1 },
    update: { quantity: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
