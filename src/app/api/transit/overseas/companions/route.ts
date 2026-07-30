import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const date = url.searchParams.get("date");
  if (!city || !date) {
    return NextResponse.json({ error: "city, date가 필요해요" }, { status: 400 });
  }

  const plans = await prisma.transitPlan.findMany({
    where: {
      city,
      travelDate: date,
      ...(session?.user?.id ? { userId: { not: session.user.id } } : {}),
    },
    orderBy: { createdAt: "desc" },
    distinct: ["userId"],
  });

  const userIds = plans.map((p) => p.userId);
  const users =
    userIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : [];
  const nameMap = new Map(users.map((u) => [u.id, u.name]));

  const profiles = plans
    .slice(0, 10)
    .map((p) => ({ userId: p.userId, name: nameMap.get(p.userId) ?? "여행자", travelTime: p.travelTime }));

  return NextResponse.json({ totalCount: plans.length, profiles });
}
