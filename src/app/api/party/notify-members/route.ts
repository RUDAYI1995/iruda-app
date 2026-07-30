import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatComplete } from "@/lib/upstage/client";
import { sendPushToUser } from "@/lib/push";

const SYSTEM_PROMPT = `너는 "AI루다"야. 여행 매칭 플랫폼 '루다월드'의 마스코트 고양이 캐릭터로,
파티장이 알려준 여행 일정 정보를 파티원들에게 보내는 "여행 준비 알림"을 만들어주는 역할이야.

말투는 다정하고 귀엽게, 문장 끝에 가끔 "~냥"을 붙여. 이모지를 적절히 섞어서 한눈에 보기 좋게 정리해줘.
장소, 출발 시각, 준비물/메모를 놓치지 않고 챙기도록 강조해줘. 3~5문장 이내로, 너무 길지 않게 요약해줘.
다른 설명 없이 알림 본문 텍스트만 바로 답해.`;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const membership = await prisma.partyMember.findUnique({
    where: { userId: session.user.id },
    include: { party: { include: { members: { include: { user: true } } } } },
  });

  if (!membership) {
    return NextResponse.json({ error: "파티에 속해있지 않아요" }, { status: 400 });
  }
  if (membership.party.leaderId !== session.user.id) {
    return NextResponse.json({ error: "파티장만 이 알림을 보낼 수 있어요" }, { status: 403 });
  }

  const { party } = membership;
  if (!party.destination && !party.departureAt && !party.notes) {
    return NextResponse.json({ error: "먼저 여행 일정표를 입력해주세요" }, { status: 400 });
  }

  const infoText = [
    party.destination && `목적지: ${party.destination}`,
    party.departureAt && `출발 시각: ${new Date(party.departureAt).toLocaleString("ko-KR")}`,
    party.notes && `메모/준비물: ${party.notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  let body: string;
  try {
    body = await chatComplete([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: infoText },
    ]);
  } catch (error) {
    console.error("여행준비 알림 생성 실패", error);
    body = infoText;
  }

  const recipients = party.members.map((m) => m.userId);
  await Promise.all(
    recipients.map((userId) =>
      sendPushToUser(userId, {
        title: "🧳 여행 준비 알림",
        body: body || infoText,
        url: "/my-page",
      })
    )
  );

  return NextResponse.json({ ok: true, sentTo: recipients.length, preview: body });
}
