import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CARE_TOPIC_LABELS } from "@/lib/shycareTopics";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const plan = await prisma.carePlan.findFirst({
    where: { userId: session.user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  if (!plan) {
    return NextResponse.json({ plan: null });
  }

  const steps = plan.steps as string[];

  return NextResponse.json({
    plan: {
      id: plan.id,
      topicLabel: CARE_TOPIC_LABELS[plan.topic] ?? plan.topic,
      concern: plan.concern,
      untilDate: plan.untilDate,
      steps,
      currentStep: plan.currentStep,
      totalSteps: steps.length,
    },
  });
}
