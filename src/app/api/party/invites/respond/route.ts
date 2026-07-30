import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { inviteId, accept } = await request.json();
  if (typeof inviteId !== "string" || typeof accept !== "boolean") {
    return NextResponse.json({ error: "잘못된 요청이에요" }, { status: 400 });
  }

  const invite = await prisma.partyInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.toUserId !== session.user.id) {
    return NextResponse.json({ error: "제안을 찾을 수 없어요" }, { status: 404 });
  }
  if (invite.status !== "PENDING") {
    return NextResponse.json({ error: "이미 처리된 제안이에요" }, { status: 400 });
  }

  if (!accept) {
    await prisma.partyInvite.update({ where: { id: inviteId }, data: { status: "DECLINED" } });
    return NextResponse.json({ ok: true });
  }

  const myMembership = await prisma.partyMember.findUnique({ where: { userId: session.user.id } });
  if (myMembership) {
    return NextResponse.json({ error: "이미 다른 파티에 속해 있어요" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.partyMember.create({ data: { partyId: invite.partyId, userId: session.user.id } }),
    prisma.partyInvite.update({ where: { id: inviteId }, data: { status: "ACCEPTED" } }),
  ]);

  return NextResponse.json({ ok: true });
}
