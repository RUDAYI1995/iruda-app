import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "iruda-visitor-id";
const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export async function POST() {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get(COOKIE_NAME)?.value;

  if (!visitorId) {
    visitorId = randomUUID();
    cookieStore.set(COOKIE_NAME, visitorId, {
      maxAge: YEAR_IN_SECONDS,
      path: "/",
      sameSite: "lax",
    });
  }

  try {
    await prisma.siteVisit.create({
      data: { visitorId, dateKey: todayKey() },
    });
  } catch {
    // 이미 오늘 방문 기록이 있으면(유니크 제약 위반) 조용히 무시 — 하루 1명당 1회만 집계
  }

  return NextResponse.json({ ok: true });
}
