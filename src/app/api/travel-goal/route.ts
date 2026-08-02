import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logRudaAlert } from "@/lib/rudaAlertLog";

// 다트 던지기 등으로 정해진 새로운 여행목표지를 저장 — 파티장이면 파티 전체 목표지,
// 그 외(파티 없음/파티원)에는 개인 목표지로 저장하고 루다알림제에 자동으로 기록함.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { destination } = await request.json();
  if (typeof destination !== "string" || !destination.trim()) {
    return NextResponse.json({ error: "여행목표지를 입력해주세요" }, { status: 400 });
  }
  const dest = destination.trim();

  const membership = await prisma.partyMember.findUnique({
    where: { userId: session.user.id },
    include: { party: true },
  });

  if (membership && membership.party.leaderId === session.user.id) {
    await prisma.party.update({
      where: { id: membership.partyId },
      data: { destination: dest },
    });
    await logRudaAlert(
      session.user.id,
      "🎯 새로운 여행목표지",
      `파티 전체의 새로운 여행목표지로 "${dest}"가 저장됐어요. 함께 준비해봐요!`
    );
    return NextResponse.json({ ok: true, scope: "party", destination: dest });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { personalDestination: dest },
  });
  await logRudaAlert(
    session.user.id,
    "🎯 새로운 여행목표지",
    `개인 새로운 여행목표지로 "${dest}"가 저장됐어요. 잊지 말고 계획을 세워봐요!`
  );
  return NextResponse.json({ ok: true, scope: "personal", destination: dest });
}
