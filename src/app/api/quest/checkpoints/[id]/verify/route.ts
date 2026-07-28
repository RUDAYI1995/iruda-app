import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { haversineDistanceMeters } from "@/lib/geo";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id: checkpointId } = await params;
  const { photoDataUrl, lat, lng } = await request.json();

  if (typeof photoDataUrl !== "string" || !photoDataUrl.startsWith("data:image")) {
    return NextResponse.json({ error: "사진을 첨부해주세요" }, { status: 400 });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { error: "GPS 위치를 확인할 수 없어요. 위치 권한을 허용해주세요" },
      { status: 400 }
    );
  }

  const checkpoint = await prisma.questCheckpoint.findUnique({
    where: { id: checkpointId },
  });
  if (!checkpoint) {
    return NextResponse.json({ error: "존재하지 않는 코스예요" }, { status: 404 });
  }

  const distanceMeters = haversineDistanceMeters(lat, lng, checkpoint.lat, checkpoint.lng);
  const verified = distanceMeters <= checkpoint.radiusMeters;

  const existing = await prisma.questCheckpointVerification.findUnique({
    where: { checkpointId_userId: { checkpointId, userId: session.user.id } },
  });

  if (existing?.verified) {
    return NextResponse.json({
      verified: true,
      distanceMeters: Math.round(existing.distanceMeters),
      alreadyDone: true,
    });
  }

  await prisma.questCheckpointVerification.upsert({
    where: { checkpointId_userId: { checkpointId, userId: session.user.id } },
    create: {
      checkpointId,
      userId: session.user.id,
      photoDataUrl,
      lat,
      lng,
      distanceMeters,
      verified,
    },
    update: { photoDataUrl, lat, lng, distanceMeters, verified },
  });

  if (verified) {
    await prisma.questCompletion.create({
      data: { userId: session.user.id, questType: "GPS_CHECKPOINT" },
    });
  }

  return NextResponse.json({
    verified,
    distanceMeters: Math.round(distanceMeters),
    radiusMeters: checkpoint.radiusMeters,
  });
}
