import { NextResponse } from "next/server";
import { isNightMarketOpen, nextOpenOrCloseLabel } from "@/lib/nightMarket";

export async function GET() {
  const open = isNightMarketOpen();
  return NextResponse.json({ open, label: nextOpenOrCloseLabel() });
}
