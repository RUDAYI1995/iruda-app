import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EVENTS, getEventRanking, type EventKey } from "@/lib/events";

export async function GET() {
  const session = await auth();
  const isOperator = Boolean((session?.user as { isOperator?: boolean } | undefined)?.isOperator);

  const eventKeys = Object.keys(EVENTS) as EventKey[];
  const rankings = await Promise.all(
    eventKeys.map(async (key) => ({
      key,
      ...EVENTS[key],
      ranking: await getEventRanking(key),
    }))
  );

  const disqualifications = isOperator
    ? await prisma.eventDisqualification.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  return NextResponse.json({ events: rankings, isOperator, disqualifications });
}
