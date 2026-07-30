import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SHOP_ITEMS } from "@/lib/shopItems";

export async function GET() {
  const session = await auth();

  const owned = session?.user?.id
    ? await prisma.inventoryItem.findMany({ where: { userId: session.user.id } })
    : [];
  const ownedMap = new Map(owned.map((o) => [o.itemId, o.quantity]));

  return NextResponse.json(
    SHOP_ITEMS.map((item) => ({ ...item, owned: ownedMap.get(item.id) ?? 0 }))
  );
}
