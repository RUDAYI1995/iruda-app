import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { breakdownMileage } from "@/lib/currency";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ loggedIn: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mileage: true },
  });
  if (!user) return NextResponse.json({ loggedIn: false });

  return NextResponse.json({
    loggedIn: true,
    total: user.mileage,
    breakdown: breakdownMileage(user.mileage),
  });
}
