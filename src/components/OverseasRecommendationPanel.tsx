"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitModeIcon } from "@/components/TransitModeIcon";
import { PartyRecruitModal } from "@/components/PartyRecruitModal";

interface LocalStep {
  mode: string;
  name: string;
  detail: string;
  durationMinutes: number;
}

interface Recommendation {
  city: string;
  hotel: string;
  hotelRecommendedByAi: boolean;
  flight: {
    airline: string;
    flightNo: string;
    departureTime: string;
    from: string;
    to: string;
    durationHours: number;
  };
  localSteps: LocalStep[];
  summary: string;
}

interface CompanionProfile {
  userId: string;
  name: string;
  travelTime: string;
}

export function OverseasRecommendationPanel({
  defaultCity = "도쿄",
}: {
  defaultCity?: string;
}) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [hotel, setHotel] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [companions, setCompanions] = useState<{ totalCount: number; profiles: CompanionProfile[] } | null>(
    null
  );
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyShownOnce, setPartyShownOnce] = useState(false);
  const bottomMarkerRef = useRef<HTMLDivElement | null>(null);

  async function getRecommendation() {
    setLoading(true);
    setError(null);
    setRec(null);
    setCompanions(null);
    setPartyShownOnce(false);
    try {
      const res = await fetch("/api/transit/overseas/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, hotel, travelDate, travelTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "추천을 받지 못했어요");
      setRec(data);

      if (travelDate) {
        const compRes = await fetch(
          `/api/transit/overseas/companions?city=${encodeURIComponent(data.city)}&date=${encodeURIComponent(travelDate)}`
        );
        if (compRes.ok) setCompanions(await compRes.json());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  }

  // 결과 마지막 부분을 스크롤로 읽는 순간, 딱 한 번만 동행 모집 팝업을 띄움
  useEffect(() => {
    if (!rec || !companions || companions.totalCount === 0 || partyShownOnce) return;
    const el = bottomMarkerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowPartyModal(true);
          setPartyShownOnce(true);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rec, companions, partyShownOnce]);

  async function handleJoinParty() {
    if (!rec || !companions) return;
    const res = await fetch("/api/transit/overseas/join-party", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: rec.city,
        date: travelDate,
        memberUserIds: companions.profiles.map((p) => p.userId),
      }),
    });
    const data = await res.json();
    setShowPartyModal(false);
    if (res.ok) router.push(`/group-chats/${data.id}`);
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            목적지 도시
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="예: 도쿄"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            목표 호텔 (선택)
          </label>
          <input
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            placeholder="예: 팍 하얏트 도쿄 (비워두면 유명 호텔 기준)"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              출발 날짜
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              출발 시각
            </label>
            <input
              type="time"
              value={travelTime}
              onChange={(e) => setTravelTime(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={getRecommendation}
          disabled={loading || !city.trim()}
          className="mt-2 self-start rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {loading ? "AI루다가 코스 짜는 중..." : "🗺️ 추천 코스 받기"}
        </button>
      </div>

      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">❌ {error}</p>}

      {rec && (
        <div className="flex flex-col gap-4">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">{rec.summary}</p>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950/30">
            <h2 className="mb-3 font-bold text-sky-900 dark:text-sky-200">✈️ 항공편</h2>
            <div className="flex items-center gap-4">
              <TransitModeIcon mode="AIRPLANE" className="h-16 w-16 text-4xl" />
              <div>
                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                  {rec.flight.airline} {rec.flight.flightNo}
                  {rec.flight.departureTime && ` · ${rec.flight.departureTime} 출발`}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {rec.flight.from} → {rec.flight.to} (약 {rec.flight.durationHours}시간)
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 font-bold text-zinc-900 dark:text-zinc-50">
              🏨 {rec.hotel}까지 현지 교통 코스
              {rec.hotelRecommendedByAi && (
                <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
                  AI루다 추천 호텔
                </span>
              )}
            </h2>
            <ol className="flex flex-col gap-3">
              {rec.localSteps.map((step, i) => (
                <li key={i} className="flex items-center gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <TransitModeIcon mode={step.mode} />
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-50">{step.name}</p>
                    <p className="text-sm text-zinc-500">
                      {step.detail} · 약 {step.durationMinutes}분
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* 이 지점이 화면에 보이면(=결과를 끝까지 읽으면) 동행 모집 팝업이 한 번 뜸 */}
          <div ref={bottomMarkerRef} />
        </div>
      )}

      {showPartyModal && companions && (
        <PartyRecruitModal
          totalCount={companions.totalCount}
          profiles={companions.profiles}
          onJoin={handleJoinParty}
          onClose={() => setShowPartyModal(false)}
        />
      )}
    </>
  );
}
