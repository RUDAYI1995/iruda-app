import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const BG_COLOR = "#fcf2e4";

// 원본 이미지에서 숫자 텍스트만 차지하는 실제 픽셀 영역을 직접 측정한 값.
// 아이콘/설명 문구(위쪽 줄)는 절대 침범하지 않음 — 숫자 칸만 딱 맞게 덮어씌움.
const STAT_SLOTS = [
  { x: 138, y: 643, width: 95, height: 45, color: "blue", unit: "명" },
  { x: 378, y: 640, width: 105, height: 36, color: "red", unit: "개" },
  { x: 598, y: 640, width: 110, height: 36, color: "orange", unit: "개" },
  { x: 808, y: 638, width: 135, height: 38, color: "green", unit: "명" },
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

// Vercel 서버리스 환경에는 폰트가 전혀 없어서(임베드된 폰트조차 sharp/librsvg가
// 렌더링하지 못함) 실시간 텍스트 렌더링이 불가능함. 그래서 숫자/글자를 로컬에서
// 미리 이미지로 그려둔 "글리프" PNG를 요청마다 나란히 합성하는 방식으로 대체함
// — 텍스트 렌더링을 아예 하지 않으므로 어떤 서버 환경에서도 동일하게 나옴.
const glyphCache = new Map<string, { buffer: Buffer; width: number; height: number }>();

async function loadGlyph(color: string, char: string) {
  const key = `${color}:${char}`;
  const cached = glyphCache.get(key);
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "public", "glyphs", color, `${char}.png`);
  const buffer = await fs.readFile(filePath);
  const metadata = await sharp(buffer).metadata();
  const entry = { buffer, width: metadata.width ?? 1, height: metadata.height ?? 1 };
  glyphCache.set(key, entry);
  return entry;
}

export async function GET() {
  const values = await getLiveStats();

  const basePath = path.join(process.cwd(), "public", "assa-game-board-v2.png");
  const baseBuffer = await fs.readFile(basePath);

  const composites: { input: Buffer; left: number; top: number }[] = [];

  for (let i = 0; i < STAT_SLOTS.length; i++) {
    const slot = STAT_SLOTS[i];

    const patch = await sharp({
      create: { width: slot.width, height: slot.height, channels: 3, background: BG_COLOR },
    })
      .png()
      .toBuffer();
    composites.push({ input: patch, left: slot.x, top: slot.y });

    const label = `${values[i]}${slot.unit}`;
    const chars = Array.from(label);
    const glyphs = await Promise.all(chars.map((c) => loadGlyph(slot.color, c)));

    const targetHeight = Math.round(slot.height * 0.85);
    const scaledGlyphs = await Promise.all(
      glyphs.map(async (g) => {
        const scale = targetHeight / g.height;
        const width = Math.max(1, Math.round(g.width * scale));
        const resized = await sharp(g.buffer).resize({ height: targetHeight }).toBuffer();
        return { buffer: resized, width };
      })
    );

    const gap = 2;
    const totalWidth =
      scaledGlyphs.reduce((sum, g) => sum + g.width, 0) + gap * (scaledGlyphs.length - 1);
    let cursorX = slot.x + slot.width / 2 - totalWidth / 2;
    const topY = slot.y + slot.height / 2 - targetHeight / 2;

    for (const g of scaledGlyphs) {
      composites.push({ input: g.buffer, left: Math.round(cursorX), top: Math.round(topY) });
      cursorX += g.width + gap;
    }
  }

  const output = await sharp(baseBuffer).composite(composites).png().toBuffer();

  return new Response(new Uint8Array(output), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
