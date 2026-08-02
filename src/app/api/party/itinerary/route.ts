import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logRudaAlert } from "@/lib/rudaAlertLog";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const membership = await prisma.partyMember.findUnique({
    where: { userId: session.user.id },
    include: { party: true },
  });

  if (!membership) {
    return NextResponse.json({ itinerary: null, isLeader: false });
  }

  return NextResponse.json({
    isLeader: membership.party.leaderId === session.user.id,
    itinerary: {
      destination: membership.party.destination,
      departureAt: membership.party.departureAt,
      notes: membership.party.notes,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { destination, departureAt, notes } = await request.json();

  const membership = await prisma.partyMember.findUnique({
    where: { userId: session.user.id },
    include: { party: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "파티에 속해있지 않아요" }, { status: 400 });
  }
  if (membership.party.leaderId !== session.user.id) {
    return NextResponse.json({ error: "파티장만 일정표를 수정할 수 있어요" }, { status: 403 });
  }

  const updated = await prisma.party.update({
    where: { id: membership.partyId },
    data: {
      destination: typeof destination === "string" ? destination : undefined,
      departureAt: departureAt ? new Date(departureAt) : undefined,
      notes: typeof notes === "string" ? notes : undefined,
    },
  });

  await logRudaAlert(
    session.user.id,
    "✈️ 파티 일정표 업데이트",
    `파티 일정표가 저장됐어요 — 목적지: ${updated.destination ?? "미정"}${
      updated.departureAt ? `, 출발: ${updated.departureAt.toLocaleString("ko-KR")}` : ""
    }`
  );

  return NextResponse.json({
    ok: true,
    itinerary: {
      destination: updated.destination,
      departureAt: updated.departureAt,
      notes: updated.notes,
    },
  });
}
