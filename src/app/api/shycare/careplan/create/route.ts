import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatComplete } from "@/lib/upstage/client";
import { CARE_TOPIC_LABELS, isCareTopic } from "@/lib/shycareTopics";

const MAX_DAYS = 14;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromKey: string, toKey: string) {
  const from = new Date(`${fromKey}T00:00:00Z`).getTime();
  const to = new Date(`${toKey}T00:00:00Z`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

async function generateSteps(topic: string, concern: string, dayCount: number): Promise<string[]> {
  const label = CARE_TOPIC_LABELS[topic];
  const system = `너는 "AI루다"야. 여행 매칭 플랫폼 '루다월드'의 마스코트 고양이 캐릭터로,
소심하고 내향적인 유저를 다정하게 돌보는 상담원 역할이야. 말투는 따뜻하고, 사람을 "닝겐"이라고 부르고 문장 끝에 가끔 "~냥"을 붙여.

상담 주제: "${label}"
유저가 적은 고민: "${concern}"

이 유저가 ${dayCount}일 동안 매일 하나씩 실천하면 고민이 조금씩 나아질 수 있는 구체적인 단계별 케어 계획을 정확히 ${dayCount}개 만들어줘.
1일차는 가장 쉽고 부담 없는 것부터, 마지막 날로 갈수록 조금씩 발전하는 순서로 구성해줘.
각 단계는 2문장 이내로, 그날 하루 실천할 수 있는 구체적인 행동을 담아줘.

반드시 아래 JSON 형식으로만 답해. 다른 설명은 붙이지 마:
{"steps":["1일차 내용","2일차 내용", ...]}`;

  const raw = await chatComplete([{ role: "system", content: system }, { role: "user", content: "케어 계획을 만들어줘" }]);
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json");
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) throw new Error("no steps");
    return parsed.steps.slice(0, dayCount).map((s: unknown) => String(s));
  } catch {
    // AI 응답 파싱 실패 시 최소한의 기본 단계로 대체
    return Array.from({ length: dayCount }, (_, i) => `${i + 1}일차: 오늘도 마음을 살펴보는 시간을 가져봐요.`);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { topic, concern, untilDate } = await request.json();

  if (!isCareTopic(topic)) {
    return NextResponse.json({ error: "알 수 없는 상담 주제예요" }, { status: 400 });
  }
  if (typeof concern !== "string" || !concern.trim()) {
    return NextResponse.json({ error: "고민 내용을 적어주세요" }, { status: 400 });
  }
  if (typeof untilDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(untilDate)) {
    return NextResponse.json({ error: "케어 종료일이 올바르지 않아요" }, { status: 400 });
  }

  const today = todayKey();
  const dayCount = daysBetween(today, untilDate) + 1; // 오늘 포함

  if (dayCount < 1) {
    return NextResponse.json({ error: "케어 종료일은 오늘 이후여야 해요" }, { status: 400 });
  }
  if (dayCount > MAX_DAYS) {
    return NextResponse.json(
      { error: `케어 기간은 최대 ${MAX_DAYS}일까지만 설정할 수 있어요` },
      { status: 400 }
    );
  }

  const steps = await generateSteps(topic, concern.trim(), dayCount);

  // 한 사람당 하나의 활성 케어만 유지
  await prisma.carePlan.updateMany({
    where: { userId: session.user.id, active: true },
    data: { active: false },
  });

  const plan = await prisma.carePlan.create({
    data: {
      userId: session.user.id,
      topic,
      concern: concern.trim(),
      untilDate,
      steps,
      currentStep: 0,
      sentToday: 0,
      active: true,
    },
  });

  return NextResponse.json({
    ok: true,
    plan: {
      id: plan.id,
      topic: plan.topic,
      concern: plan.concern,
      untilDate: plan.untilDate,
      steps: plan.steps,
      dayCount,
    },
  });
}
