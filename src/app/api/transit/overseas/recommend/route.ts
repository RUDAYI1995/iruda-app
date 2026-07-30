import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatComplete } from "@/lib/upstage/client";

const FALLBACK = {
  hotel: "호텔 뉴 오타니 도쿄",
  flight: {
    airline: "대한항공",
    flightNo: "KE001",
    departureTime: "09:00",
    from: "인천국제공항(ICN)",
    to: "나리타국제공항(NRT)",
    durationHours: 2.5,
  },
  localSteps: [
    { mode: "TRAIN", name: "나리타 익스프레스(N'EX)", detail: "나리타공항 → 도쿄역", durationMinutes: 60 },
    { mode: "TRAIN", name: "JR 야마노테선", detail: "도쿄역 → 목적지 인근역", durationMinutes: 15 },
    { mode: "WALK", name: "도보", detail: "역에서 호텔까지", durationMinutes: 8 },
  ],
  summary: "인천에서 나리타로 입국 후, 나리타 익스프레스와 JR선을 갈아타면 도쿄 시내 호텔까지 편하게 이동할 수 있어요.",
};

const MODE_KEYWORDS: [RegExp, string][] = [
  [/subway|metro|지하철|메트로/i, "SUBWAY"],
  [/bus|버스/i, "BUS"],
  [/taxi|cab|택시/i, "TAXI"],
  [/walk|도보/i, "WALK"],
  [/train|express|rail|maglev|기차|열차|익스프레스|자기부상/i, "TRAIN"],
];

function normalizeMode(rawMode: string): string {
  const upper = rawMode.toUpperCase();
  if (["TRAIN", "BUS", "TAXI", "WALK", "SUBWAY"].includes(upper)) return upper;
  for (const [pattern, mode] of MODE_KEYWORDS) {
    if (pattern.test(rawMode)) return mode;
  }
  return "TRAIN";
}

export async function POST(request: Request) {
  const session = await auth();
  const { city, hotel, travelDate, travelTime } = await request.json();
  const cityName = typeof city === "string" && city.trim() ? city.trim() : "도쿄";
  const userHotel = typeof hotel === "string" && hotel.trim() ? hotel.trim() : null;
  const date = typeof travelDate === "string" && travelDate ? travelDate : null;
  const time = typeof travelTime === "string" && travelTime ? travelTime : null;

  const scheduleNote =
    date || time
      ? `출발 목표 날짜: ${date ?? "미정"}, 목표 시각: ${time ?? "미정"}. 이 시각과 가장 가까운 시간대에 실제로 있을 법한 항공편(항공편명 예시 포함)을 골라서 추천해.`
      : "";

  try {
    const raw = await chatComplete([
      {
        role: "system",
        content:
          "너는 여행 교통 경로를 추천하는 AI루다야. 한국(인천/김포)에서 출발해 목적 도시로 가는 항공편과, 도착 공항에서 목적지 호텔까지의 현지 교통 경로를 추천해. " +
          "호텔이 정해지지 않았다면 그 도시의 실존하는 유명 호텔을 하나 골라서 추천해. " +
          '반드시 아래 JSON 형식으로만 답해, 다른 텍스트 없이: {"hotel":"호텔명","flight":{"airline":"항공사명","flightNo":"편명 예시","departureTime":"HH:mm","from":"출발공항","to":"도착공항","durationHours":숫자},"localSteps":[{"mode":"TRAIN|BUS|TAXI|WALK|SUBWAY","name":"교통수단/노선명","detail":"구간 설명","durationMinutes":숫자}],"summary":"한국어 한두 문장 요약 (호텔을 직접 추천한 경우 왜 그 호텔을 골랐는지도 한마디 포함)"}',
      },
      {
        role: "user",
        content: `목적지 도시: ${cityName}, 목표 호텔: ${userHotel ?? "미정 — 유명 호텔 추천 필요"}. ${scheduleNote} 실제로 존재하는 항공사와 현지 교통수단 이름으로 현실적인 추천 코스를 짜줘.`,
      },
    ]);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("파싱 실패");
    const parsed = JSON.parse(match[0]);
    if (!parsed.flight || !Array.isArray(parsed.localSteps)) throw new Error("형식 오류");

    const finalHotel = userHotel ?? parsed.hotel ?? "추천 호텔";

    if (session?.user?.id && date && time) {
      await prisma.transitPlan.create({
        data: {
          userId: session.user.id,
          city: cityName,
          hotel: finalHotel,
          travelDate: date,
          travelTime: time,
        },
      });
    }

    return NextResponse.json({
      ...parsed,
      city: cityName,
      hotel: finalHotel,
      hotelRecommendedByAi: !userHotel,
      localSteps: parsed.localSteps.map((step: { mode: string }) => ({
        ...step,
        mode: normalizeMode(step.mode ?? ""),
      })),
    });
  } catch {
    return NextResponse.json({
      ...FALLBACK,
      city: cityName,
      hotel: userHotel ?? FALLBACK.hotel,
      hotelRecommendedByAi: !userHotel,
    });
  }
}
