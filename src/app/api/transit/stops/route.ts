import { NextResponse } from "next/server";
import { searchBusStops } from "@/lib/transit/tago";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityCode = searchParams.get("cityCode");
  const query = searchParams.get("query");

  if (!cityCode || !query) {
    return NextResponse.json(
      { error: "cityCode와 query가 필요해요" },
      { status: 400 }
    );
  }

  try {
    const stops = await searchBusStops(cityCode, query);
    return NextResponse.json({ stops });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "조회 중 오류가 발생했어요" },
      { status: 500 }
    );
  }
}
