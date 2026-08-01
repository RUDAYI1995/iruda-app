import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const rows = await prisma.dungeonStageProgress.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ clearedStages: rows.map((r) => r.stageIndex) });
}
