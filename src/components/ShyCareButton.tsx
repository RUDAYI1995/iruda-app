"use client";

import { useState } from "react";

type Pick = {
  title: string;
  summary: string;
  image: string;
  place: string;
  mapUrl: string;
  latitude: number | null;
  longitude: number | null;
};
type ChatEntry = { role: "user" | "ai"; text: string; picks?: Pick[] };

type UserLocation = { latitude: number; longitude: number };

function distanceKm(a: UserLocation, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// 실제 경로 API 없이 직선거리 기반으로 대략 추정한 예상 소요시간 (참고용)
function estimateTravelMinutes(km: number) {
  const carMin = Math.round((km / 60) * 60 + 5);
  const transitMin = Math.round((km / 38) * 60 + 15);
  return { carMin, transitMin };
}

type CareTopic = {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  top: string;
  intro: string;
  placeholder: string;
};

const TOPICS: CareTopic[] = [
  {
    key: "heart",
    emoji: "❤️",
    title: "마음 상담",
    desc: "불안, 걱정, 스트레스 등 마음 속 이야기를 나눠요.",
    top: "22.7%",
    intro:
      "요즘 불안하거나 걱정되는 게 있었다면 여기서 편하게 이야기해도 괜찮아요. AI루다가 마음을 살펴줄게요.",
    placeholder: "요즘 마음이 어떠셨는지 편하게 적어주세요",
  },
  {
    key: "travel",
    emoji: "🧳",
    title: "여행 고민 해결",
    desc: "여행 계획, 일정, 준비 등 여행에 대한 고민을 도와드려요.",
    top: "37.0%",
    intro:
      "여행 계획을 어디서부터 시작해야 할지 막막했다면, AI루다가 일정부터 준비물까지 하나씩 같이 정리해줄게요.",
    placeholder: "예: 3박 4일 오사카 여행, 뭐부터 준비해야 할지 모르겠어요",
  },
  {
    key: "relationship",
    emoji: "🧑‍🤝‍🧑",
    title: "대인관계 상담",
    desc: "친구, 연인, 가족 관계 등 소통이 어려울 때 함께 고민해요.",
    top: "51.2%",
    intro:
      "사람 사이 거리가 어렵게 느껴질 때도 있죠. 편하게 상황을 들려주면 AI루다가 같이 고민해줄게요.",
    placeholder: "어떤 관계 때문에 고민이신가요?",
  },
  {
    key: "courage",
    emoji: "⭐",
    title: "용기 충전",
    desc: "작은 용기가 필요할 때, AI루다가 응원해드려요!",
    top: "65.5%",
    intro: "오늘 조금 자신이 없었다면, AI루다가 힘이 되는 응원을 가득 담아드릴게요!",
    placeholder: "지금 어떤 일에 용기가 필요하신가요?",
  },
  {
    key: "recommend",
    emoji: "🎁",
    title: "맞춤 추천 서비스",
    desc: "당신에게 꼭 맞는 여행지, 활동, 힐링 방법을 추천해드려요.",
    top: "79.8%",
    intro: "당신의 성향과 원하는 여행 스타일을 알려주시면, AI루다가 딱 맞는 걸 추천해줄게요.",
    placeholder: "예: 혼자 조용히 힐링하는 여행지를 원해요",
  },
];

export function ShyCareButton() {
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<CareTopic | null>(null);
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showCareForm, setShowCareForm] = useState(false);
  const [careDate, setCareDate] = useState("");
  const [careSubmitting, setCareSubmitting] = useState(false);
  const [careMessage, setCareMessage] = useState<string | null>(null);

  const openTopic = (t: CareTopic) => {
    setActiveTopic(t);
    setHistory([{ role: "ai", text: t.intro }]);
    setInput("");
    setShowCareForm(false);
    setCareDate("");
    setCareMessage(null);
  };

  const lastUserMessage = [...history].reverse().find((h) => h.role === "user")?.text ?? "";

  async function submitCarePlan() {
    if (!activeTopic || !careDate || !lastUserMessage) return;
    setCareSubmitting(true);
    setCareMessage(null);
    try {
      const res = await fetch("/api/shycare/careplan/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeTopic.key,
          concern: lastUserMessage,
          untilDate: careDate,
        }),
      });
      const data = await res.json();
      setCareMessage(
        res.ok
          ? `${careDate}까지 하루 3번, 오늘 말한 고민에 맞춘 단계별 알림을 보내드릴게요! 🔔`
          : data.error ?? "케어 신청에 실패했어요"
      );
    } catch {
      setCareMessage("케어 신청 중 문제가 생겼어요.");
    } finally {
      setCareSubmitting(false);
    }
  }

  function locateUser() {
    if (!navigator.geolocation) {
      setLocationError("이 브라우저에서는 위치 확인이 안 돼요.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError("위치 확인을 허용해주셔야 예상 도착시간을 볼 수 있어요.");
        setLocating(false);
      }
    );
  }

  const closeTopic = () => {
    setActiveTopic(null);
    setHistory([]);
  };

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || !activeTopic) return;
    const nextHistory: ChatEntry[] = [...history, { role: "user", text }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/shycare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeTopic.key,
          messages: nextHistory.map((h) => ({
            role: h.role === "ai" ? "assistant" : "user",
            content: h.text,
          })),
        }),
      });
      const data = await res.json();
      setHistory((h) => [
        ...h,
        { role: "ai", text: data.reply ?? "냥...?", picks: data.picks },
      ]);
    } catch {
      setHistory((h) => [...h, { role: "ai", text: "냥...! 지금 대답하기 어려운 것 같아." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-800 shadow-sm transition-transform hover:scale-105 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
        aria-expanded={open}
      >
        <span className="relative inline-flex h-4 w-5 shrink-0 items-center justify-center text-sm">
          <span className="absolute -top-1 left-0 -rotate-12">☂️</span>
          <span className="absolute -bottom-0.5 right-0 text-[10px]">🧍</span>
        </span>
        소심케어제
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-700 shadow-md hover:bg-white"
            aria-label="소심케어제 닫기"
          >
            ✕
          </button>

          <div className="relative w-full max-w-[640px] overflow-hidden rounded-3xl shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/shycare.png" alt="소심케어제" className="block w-full" />

            {TOPICS.map((t) => (
              <button
                key={t.key}
                onClick={() => openTopic(t)}
                className="absolute rounded-2xl transition-colors hover:bg-violet-400/10 focus:outline-none"
                style={{ left: "49.2%", width: "49.2%", top: t.top, height: "13.4%" }}
                aria-label={t.title}
              />
            ))}
          </div>
        </div>
      )}

      {activeTopic && (
        <div
          className="fixed inset-0 z-[310] flex items-center justify-center bg-black/60 p-4"
          onClick={closeTopic}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col rounded-3xl border border-violet-200 bg-white p-6 shadow-2xl dark:border-violet-900 dark:bg-zinc-950"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeTopic.emoji}</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {activeTopic.title}
                </h2>
              </div>
              <button
                onClick={closeTopic}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="mb-3 flex max-h-80 min-h-[120px] flex-col gap-2 overflow-y-auto rounded-2xl bg-violet-50/40 p-3 dark:bg-violet-950/10">
              {history.map((entry, i) => (
                <div key={i} className="contents">
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                      entry.role === "ai"
                        ? "self-start bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
                        : "self-end bg-violet-600 text-white"
                    }`}
                  >
                    {entry.text}
                  </div>
                  {entry.picks && entry.picks.length > 0 && (
                    <div className="flex w-full flex-col gap-2 self-start">
                      {!userLocation && (
                        <button
                          type="button"
                          onClick={locateUser}
                          disabled={locating}
                          className="self-start rounded-full border border-violet-300 bg-white px-3 py-1 text-[11px] font-medium text-violet-600 shadow-sm hover:bg-violet-50 disabled:opacity-50 dark:border-violet-800 dark:bg-zinc-900 dark:text-violet-300"
                        >
                          {locating ? "위치 확인 중..." : "📍 내 위치 확인하고 예상 도착시간 보기"}
                        </button>
                      )}
                      {locationError && (
                        <p className="text-[11px] text-red-500">{locationError}</p>
                      )}

                      {entry.picks.map((p, pi) => {
                        const hasCoords = p.latitude != null && p.longitude != null;
                        const km =
                          userLocation && hasCoords
                            ? distanceKm(userLocation, { latitude: p.latitude!, longitude: p.longitude! })
                            : null;
                        const times = km != null ? estimateTravelMinutes(km) : null;

                        return (
                          <div
                            key={pi}
                            className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm dark:border-violet-900/40 dark:bg-zinc-900"
                          >
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.image}
                                alt={p.title}
                                className="h-16 w-16 shrink-0 object-cover"
                              />
                              <div className="min-w-0 flex-1 py-1.5 pr-3">
                                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                  {p.title}
                                </p>
                                <p className="text-xs leading-4 text-zinc-500 dark:text-zinc-400">
                                  {p.summary}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t border-violet-50 px-3 py-1.5 dark:border-violet-900/30">
                              <a
                                href={p.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-medium text-violet-600 hover:underline dark:text-violet-300"
                              >
                                🔗 {p.place} 알아보기
                              </a>
                              {times && (
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  🚗 약 {times.carMin}분 · 🚌 약 {times.transitMin}분
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="self-start rounded-2xl bg-white px-3 py-2 text-sm text-violet-400 shadow-sm dark:bg-zinc-900">
                  냥... 생각 중...
                </div>
              )}
            </div>

            <div className="flex gap-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder={activeTopic.placeholder}
                className="min-w-0 flex-1 rounded-full border border-violet-200 px-3 py-1.5 text-sm dark:border-violet-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              >
                전송
              </button>
            </div>

            {activeTopic.key !== "recommend" && (
              <div className="mt-3 border-t border-violet-100 pt-3 dark:border-violet-900/40">
                {!showCareForm ? (
                  <button
                    onClick={() => setShowCareForm(true)}
                    disabled={!lastUserMessage}
                    className="text-xs font-medium text-violet-600 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline dark:text-violet-300"
                  >
                    📅 이 고민, 며칠 동안 꾸준히 케어받고 싶어요
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 rounded-2xl bg-violet-50/60 p-3 dark:bg-violet-950/20">
                    <p className="text-xs leading-4 text-violet-700 dark:text-violet-300">
                      방금 말씀하신 고민에 맞춰, 설정한 날짜까지 하루 3번(아침·낮·저녁) 단계별 알림을 보내드려요. (최대 14일)
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={careDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCareDate(e.target.value)}
                        className="rounded-lg border border-violet-200 px-2 py-1 text-xs dark:border-violet-800 dark:bg-zinc-900 dark:text-zinc-50"
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">까지 케어</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={submitCarePlan}
                        disabled={careSubmitting || !careDate}
                        className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {careSubmitting ? "신청 중..." : "케어 시작하기"}
                      </button>
                      <button
                        onClick={() => setShowCareForm(false)}
                        className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                      >
                        취소
                      </button>
                    </div>
                    {careMessage && (
                      <p className="text-[11px] text-violet-700 dark:text-violet-300">{careMessage}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
