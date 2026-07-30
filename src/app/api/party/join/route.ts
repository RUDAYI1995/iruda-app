import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { targetUserId } = await request.json();
  if (typeof targetUserId !== "string") {
    return NextResponse.json({ error: "targetUserId가 필요해요" }, { status: 400 });
  }
  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "자기 자신에게는 할 수 없어요" }, { status: 400 });
  }

  const myMembership = await prisma.partyMember.findUnique({ where: { userId: session.user.id } });
  if (myMembership) {
    return NextResponse.json({ error: "이미 파티에 속해 있어요" }, { status: 400 });
  }

  const targetMembership = await prisma.partyMember.findUnique({
    where: { userId: targetUserId },
  });

  let partyId: string;
  if (targetMembership) {
    partyId = targetMembership.partyId;
  } else {
    const party = await prisma.party.create({
      data: {
        leaderId: targetUserId,
        members: { create: { userId: targetUserId } },
      },
    });
    partyId = party.id;
  }

  await prisma.partyMember.create({ data: { partyId, userId: session.user.id } });

  return NextResponse.json({ ok: true, partyId });
}
