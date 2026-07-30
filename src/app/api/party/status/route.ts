import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId가 필요해요" }, { status: 400 });
  }

  const membership = await prisma.partyMember.findUnique({ where: { userId } });
  return NextResponse.json({ inParty: !!membership });
}
