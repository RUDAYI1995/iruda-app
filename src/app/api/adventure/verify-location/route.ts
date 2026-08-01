import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { haversineDistanceMeters } from "@/lib/geo";

// 대구 시청 좌표 기준 — "대프리카"(대구) 방문 인증용
const DAEGU_CENTER = { lat: 35.8714, lng: 128.6014 };
const DAEGU_RADIUS_METERS = 25000; // 대구 시내 전역을 넉넉히 커버

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { lat, lng, zoneSlug, missionIndex } = await request.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { error: "GPS 위치를 확인할 수 없어요. 위치 권한을 허용해주세요" },
      { status: 400 }
    );
  }

  const distanceMeters = haversineDistanceMeters(lat, lng, DAEGU_CENTER.lat, DAEGU_CENTER.lng);
  const verified = distanceMeters <= DAEGU_RADIUS_METERS;

  if (verified && typeof zoneSlug === "string" && typeof missionIndex === "number") {
    await prisma.adventureMissionProgress.upsert({
      where: { userId_zoneSlug_missionIndex: { userId: session.user.id, zoneSlug, missionIndex } },
      update: { count: { increment: 1 } },
      create: { userId: session.user.id, zoneSlug, missionIndex, count: 1 },
    });
  }

  return NextResponse.json({
    verified,
    distanceKm: Math.round(distanceMeters / 1000),
  });
}
