import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const membership = await prisma.partyMember.findUnique({
    where: { userId: session.user.id },
    include: {
      party: {
        include: { members: { include: { user: true } }, leader: true },
      },
    },
  });

  const invites = await prisma.partyInvite.findMany({
    where: { toUserId: session.user.id, status: "PENDING" },
    include: { fromUser: true, party: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    party: membership
      ? {
          id: membership.party.id,
          isLeader: membership.party.leaderId === session.user.id,
          leaderId: membership.party.leaderId,
          leaderName: membership.party.leader.name,
          members: membership.party.members.map((m) => ({
            userId: m.userId,
            name: m.user.name,
          })),
        }
      : null,
    invites: invites.map((i) => ({
      id: i.id,
      fromUserId: i.fromUserId,
      fromName: i.fromUser.name,
      createdAt: i.createdAt,
    })),
  });
}
