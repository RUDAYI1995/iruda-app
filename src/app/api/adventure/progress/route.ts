import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  const zoneSlug = new URL(request.url).searchParams.get("zoneSlug");
  if (!zoneSlug) {
    return NextResponse.json({ error: "zoneSlug가 필요해요" }, { status: 400 });
  }

  const rows = await prisma.adventureMissionProgress.findMany({
    where: { userId: session.user.id, zoneSlug },
  });

  const progress: Record<number, number> = {};
  for (const row of rows) progress[row.missionIndex] = row.count;
  return NextResponse.json({ progress });
}
