import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { chatComplete } from "@/lib/upstage/client";

const Schema = z.object({ preference: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "여행 취향을 입력해주세요." }, { status: 400 });
  }

  const attractions = await prisma.attraction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (attractions.length === 0) {
    return NextResponse.json({
      recommendedIds: [],
      message: "아직 등록된 관광지가 없어요. 먼저 관광지를 추가해주세요.",
    });
  }

  const catalog = attractions
    .map((a) => `- id:${a.id} | ${a.name} (${a.region}, ${a.category}) - ${a.description}`)
    .join("\n");

  try {
    const raw = await chatComplete([
      {
        role: "system",
        content:
          "너는 여행 코스 추천 도우미야. 주어진 관광지 목록 중에서 사용자 취향에 가장 잘 맞는 곳을 최대 5개 골라서, 반드시 JSON 배열로만 응답해. 형식: [{\"id\":\"...\",\"reason\":\"한 문장 이유\"}]. 다른 설명은 절대 붙이지 마.",
      },
      {
        role: "user",
        content: `관광지 목록:\n${catalog}\n\n사용자 취향: ${parsed.data.preference}`,
      },
    ]);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const picks: { id: string; reason: string }[] = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : [];

    const validIds = new Set(attractions.map((a) => a.id));
    const filtered = picks.filter((p) => validIds.has(p.id));

    return NextResponse.json({ recommendedIds: filtered });
  } catch {
    return NextResponse.json({
      recommendedIds: [],
      message:
        "AI 추천을 사용할 수 없어요. UPSTAGE_API_KEY 설정을 확인해주세요.",
    });
  }
}
