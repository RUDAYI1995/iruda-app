import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatCompleteVision } from "@/lib/upstage/client";

const KEYWORD_PROMPTS: Record<string, string> = {
  hotspring: "온천이나 목욕탕, 스파처럼 물이 있는 온천 시설",
  fireworks: "불꽃놀이나 폭죽이 터지는 장면",
  campfire: "캠프파이어나 모닥불, 파이어캠프 장면",
  sauna: "사우나 내부 모습",
};

const LABELS: Record<string, string> = {
  hotspring: "온천 방문 인증",
  fireworks: "폭죽 인증",
  campfire: "파이어캠프 인증",
  sauna: "사우나 인증",
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { topic, image, lat, lng, zoneSlug, missionIndex } = await request.json();
  const promptTarget = KEYWORD_PROMPTS[topic];
  if (!promptTarget) {
    return NextResponse.json({ error: "알 수 없는 인증 종류예요" }, { status: 400 });
  }
  if (typeof image !== "string" || !image.startsWith("data:image")) {
    return NextResponse.json({ error: "사진을 찍어주세요" }, { status: 400 });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "위치 권한을 허용해야 인증할 수 있어요" }, { status: 400 });
  }
  if (typeof zoneSlug !== "string" || typeof missionIndex !== "number") {
    return NextResponse.json({ error: "잘못된 요청이에요" }, { status: 400 });
  }

  // 1차: AI 비전 판독 시도 (현재 사용 모델은 이미지 입력을 지원하지 않아 대부분 실패함 —
  // 실패하거나 판단이 애매하면 사람 다수결(루다투표제)로 넘김)
  try {
    const raw = await chatCompleteVision([
      {
        role: "system",
        content: `너는 사진 속에 "${promptTarget}"이(가) 실제로 보이는지 판단하는 심사관이야.
반드시 아래 JSON 형식으로만 답해: {"verified": true 또는 false, "reason": "한 문장 이유"}`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: `이 사진에 ${promptTarget}이(가) 보이나요?` },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ]);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return NextResponse.json({
        verified: !!parsed.verified,
        reason: typeof parsed.reason === "string" ? parsed.reason : "",
      });
    }
  } catch {
    // AI 판독 불가 — 아래에서 투표로 넘김
  }

  const vote = await prisma.rudaVote.create({
    data: {
      kind: "MISSION",
      label: `${LABELS[topic] ?? "미션 인증"} (위도 ${lat.toFixed(3)}, 경도 ${lng.toFixed(3)})`,
      photoAUrl: image,
      requesterId: session.user.id,
      contextJson: { zoneSlug, missionIndex, topic, lat, lng },
    },
  });

  return NextResponse.json({ pending: true, voteId: vote.id });
}
