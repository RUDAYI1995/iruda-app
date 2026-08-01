import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatCompleteVision } from "@/lib/upstage/client";
import { DUNGEON_STAGES, DUNGEON_CLEAR_MILEAGE } from "@/lib/assaDungeon";
import { addExp, EXP_SOURCES } from "@/lib/leveling";
import { addMileage } from "@/lib/currency";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { stageIndex, image, lat, lng } = await request.json();
  const stage = DUNGEON_STAGES.find((s) => s.index === stageIndex);
  if (!stage) {
    return NextResponse.json({ error: "알 수 없는 스테이지예요" }, { status: 400 });
  }
  if (typeof image !== "string" || !image.startsWith("data:image")) {
    return NextResponse.json({ error: "사진을 찍어주세요" }, { status: 400 });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "위치 권한을 허용해야 인증할 수 있어요" }, { status: 400 });
  }

  const already = await prisma.dungeonStageProgress.findUnique({
    where: { userId_stageIndex: { userId: session.user.id, stageIndex } },
  });
  if (already) {
    return NextResponse.json({ verified: true, alreadyCleared: true });
  }

  // 1차: AI 비전 판독 시도 — 실패/애매하면 사람 다수결(루다투표제)로 넘김
  try {
    const raw = await chatCompleteVision([
      {
        role: "system",
        content: `너는 사진 속에 "${stage.photoTopic}"이(가) 실제로 보이는지 판단하는 심사관이야.
반드시 아래 JSON 형식으로만 답해: {"verified": true 또는 false, "reason": "한 문장 이유"}`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: `이 사진에 ${stage.photoTopic}이(가) 보이나요?` },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ]);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.verified) {
        await prisma.dungeonStageProgress.create({
          data: { userId: session.user.id, stageIndex },
        });
        await addMileage(session.user.id, DUNGEON_CLEAR_MILEAGE);
        await addExp(session.user.id, EXP_SOURCES.MISSION);
        return NextResponse.json({
          verified: true,
          reason: parsed.reason ?? "",
          mileageGained: DUNGEON_CLEAR_MILEAGE,
          expGained: EXP_SOURCES.MISSION,
        });
      }
      return NextResponse.json({ verified: false, reason: parsed.reason ?? "" });
    }
  } catch {
    // AI 판독 불가 — 아래에서 투표로 넘김
  }

  const vote = await prisma.rudaVote.create({
    data: {
      kind: "MISSION",
      label: `[아싸던전·솔플] ${stage.realMission} (위도 ${lat.toFixed(3)}, 경도 ${lng.toFixed(3)})`,
      photoAUrl: image,
      requesterId: session.user.id,
      contextJson: { stageIndex, topic: stage.photoTopic, lat, lng },
    },
  });

  return NextResponse.json({ pending: true, voteId: vote.id });
}
