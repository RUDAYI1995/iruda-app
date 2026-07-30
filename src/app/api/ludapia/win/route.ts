import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addExp, EXP_SOURCES } from "@/lib/leveling";
import { addMileage, MILEAGE_SOURCES } from "@/lib/currency";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await addExp(session.user.id, EXP_SOURCES.GAME_WIN);
  await addMileage(session.user.id, MILEAGE_SOURCES.GAME_WIN);
  return NextResponse.json({ ok: true });
}
