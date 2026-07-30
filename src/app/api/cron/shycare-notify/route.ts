import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { CARE_TOPIC_LABELS } from "@/lib/shycareTopics";

const SLOT_LABELS = ["🌅 아침 케어", "☀️ 낮 케어", "🌙 저녁 케어"];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function checkAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 시크릿 미설정 시(로컬 개발) 통과
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  if (!checkAuthorized(request)) {
    return NextResponse.json({ error: "인증이 필요해요" }, { status: 401 });
  }

  const today = todayKey();
  const plans = await prisma.carePlan.findMany({ where: { active: true } });

  const results: { planId: string; action: string }[] = [];

  for (const plan of plans) {
    const steps = plan.steps as string[];

    if (plan.untilDate < today) {
      await prisma.carePlan.update({ where: { id: plan.id }, data: { active: false } });
      await sendPushToUser(plan.userId, {
        title: "소심케어제 완료 🎉",
        body: `${CARE_TOPIC_LABELS[plan.topic] ?? plan.topic} 케어 기간이 끝났어요. 그동안 잘 해내셨어요, 닝겐! 언제든 다시 요청해주세요 🐾`,
        url: "/home",
      });
      results.push({ planId: plan.id, action: "completed" });
      continue;
    }

    let currentStep = plan.currentStep;
    let sentToday = plan.sentToday;
    const isNewDay = plan.lastSentDate !== today;

    if (isNewDay) {
      currentStep = plan.lastSentDate === null ? 0 : plan.currentStep + 1;
      if (currentStep >= steps.length) {
        await prisma.carePlan.update({ where: { id: plan.id }, data: { active: false } });
        await sendPushToUser(plan.userId, {
          title: "소심케어제 완료 🎉",
          body: `${CARE_TOPIC_LABELS[plan.topic] ?? plan.topic} 케어 단계를 모두 마쳤어요! 고생 많았어요, 닝겐 🐾`,
          url: "/home",
        });
        results.push({ planId: plan.id, action: "completed" });
        continue;
      }
      sentToday = 0;
    }

    if (sentToday >= 3) {
      results.push({ planId: plan.id, action: "skipped_already_sent" });
      continue;
    }

    const stepText = steps[currentStep] ?? "오늘도 마음을 잘 살펴봐요.";
    const slotLabel = SLOT_LABELS[sentToday] ?? SLOT_LABELS[SLOT_LABELS.length - 1];

    await sendPushToUser(plan.userId, {
      title: `소심케어제 · ${slotLabel}`,
      body: stepText,
      url: "/home",
    });

    await prisma.carePlan.update({
      where: { id: plan.id },
      data: { currentStep, sentToday: sentToday + 1, lastSentDate: today },
    });

    results.push({ planId: plan.id, action: "sent" });
  }

  return NextResponse.json({ ok: true, checked: plans.length, results });
}
