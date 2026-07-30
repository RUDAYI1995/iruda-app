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

  const targetMembership = await prisma.partyMember.findUnique({
    where: { userId: targetUserId },
  });
  if (targetMembership) {
    return NextResponse.json({ error: "상대방은 이미 다른 파티에 속해 있어요" }, { status: 400 });
  }

  let myMembership = await prisma.partyMember.findUnique({
    where: { userId: session.user.id },
    include: { party: true },
  });

  if (!myMembership) {
    const party = await prisma.party.create({
      data: {
        leaderId: session.user.id,
        members: { create: { userId: session.user.id } },
      },
      include: { members: true },
    });
    myMembership = { ...party.members[0], party };
  } else if (myMembership.party.leaderId !== session.user.id) {
    return NextResponse.json({ error: "파티장만 파티를 제안할 수 있어요" }, { status: 403 });
  }

  const existingInvite = await prisma.partyInvite.findUnique({
    where: { partyId_toUserId: { partyId: myMembership.partyId, toUserId: targetUserId } },
  });
  if (existingInvite && existingInvite.status === "PENDING") {
    return NextResponse.json({ error: "이미 제안을 보냈어요" }, { status: 400 });
  }

  const invite = existingInvite
    ? await prisma.partyInvite.update({
        where: { id: existingInvite.id },
        data: { status: "PENDING" },
      })
    : await prisma.partyInvite.create({
        data: {
          partyId: myMembership.partyId,
          fromUserId: session.user.id,
          toUserId: targetUserId,
        },
      });

  return NextResponse.json({ ok: true, inviteId: invite.id });
}
