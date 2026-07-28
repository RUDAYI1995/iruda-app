import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const IMAGE_WIDTH = 1023;
const IMAGE_HEIGHT = 1537;
const BG_COLOR = "#fcf2e4";

// 원본 이미지에서 숫자 텍스트만 차지하는 실제 픽셀 영역을 직접 측정한 값.
// 아이콘/설명 문구(위쪽 줄)는 절대 침범하지 않음 — 숫자 칸만 딱 맞게 덮어씌움.
const STAT_SLOTS = [
  { x: 138, y: 643, width: 95, height: 45, color: "#2f6fd1", unit: "명" },
  { x: 378, y: 640, width: 105, height: 36, color: "#e0435c", unit: "개" },
  { x: 598, y: 640, width: 110, height: 36, color: "#f0862c", unit: "개" },
  { x: 808, y: 638, width: 135, height: 38, color: "#3fae4a", unit: "명" },
];

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

async function getLiveStats() {
  const [newTravelersToday, cheerMessagesToday, questsCompletedToday, activeTravelerRows] =
    await Promise.all([
      prisma.siteVisit.count({ where: { dateKey: todayKey() } }),
      prisma.cheerClick.count({ where: { createdAt: { gte: todayStart() } } }),
      prisma.questCompletion.count({ where: { createdAt: { gte: todayStart() } } }),
      prisma.readyRoomParticipant.findMany({
        where: { readyRoom: { status: "CONFIRMED" } },
        select: { userId: true },
        distinct: ["userId"],
      }),
    ]);

  return [
    newTravelersToday,
    cheerMessagesToday,
    questsCompletedToday,
    activeTravelerRows.length,
  ];
}

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const values = await getLiveStats();

  const rects = STAT_SLOTS.map((slot, i) => {
    const cx = slot.x + slot.width / 2;
    const cy = slot.y + slot.height / 2;
    const label = escapeXml(`${values[i].toLocaleString()}${slot.unit}`);
    const fontSize = Math.round(slot.height * 0.75);

    return `
      <rect x="${slot.x}" y="${slot.y}" width="${slot.width}" height="${slot.height}" fill="${BG_COLOR}" />
      <text x="${cx}" y="${cy}" font-family="sans-serif" font-weight="800" font-size="${fontSize}" fill="${slot.color}" text-anchor="middle" dominant-baseline="central">${label}</text>
    `;
  }).join("\n");

  const svg = `
    <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${rects}
    </svg>
  `;

  const basePath = path.join(process.cwd(), "public", "assa-game-board-v2.png");
  const baseBuffer = await fs.readFile(basePath);

  const output = await sharp(baseBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  return new Response(new Uint8Array(output), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
