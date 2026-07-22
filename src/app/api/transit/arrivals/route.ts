import { NextResponse } from "next/server";
import { getArrivals } from "@/lib/transit/tago";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityCode = searchParams.get("cityCode");
  const nodeId = searchParams.get("nodeId");

  if (!cityCode || !nodeId) {
    return NextResponse.json(
      { error: "cityCode와 nodeId가 필요해요" },
      { status: 400 }
    );
  }

  try {
    const arrivals = await getArrivals(cityCode, nodeId);
    return NextResponse.json({ arrivals });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "조회 중 오류가 발생했어요" },
      { status: 500 }
    );
  }
}
