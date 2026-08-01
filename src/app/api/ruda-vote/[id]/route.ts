import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  const { id } = await params;
  const vote = await prisma.rudaVote.findUnique({ where: { id }, include: { ballots: true } });
  if (!vote) {
    return NextResponse.json({ error: "투표를 찾을 수 없어요" }, { status: 404 });
  }
  return NextResponse.json({ status: vote.status, totalVotes: vote.ballots.length });
}
