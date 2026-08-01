"use client";

import { useEffect, useRef, useState } from "react";
import type { AdventureZone } from "@/lib/adventureZones";

type ChatEntry = { role: "user" | "ai"; text: string };

const LOCATION_IDS = [
  "waterfall",
  "fortress",
  "cave",
  "altar",
  "hill",
  "mine",
  "shop",
  "hotspring",
  "bridge",
];

// 미션 순서(0~4)에 맞춰 실제 인증 방식을 지정 — GPS는 위치, 나머지는 실시간 사진 인증(AI 비전 판독)
const MISSION_VERIFY: { type: "gps" | "photo"; topic?: string }[] = [
  { type: "gps" },
  { type: "photo", topic: "hotspring" },
  { type: "photo", topic: "fireworks" },
  { type: "photo", topic: "campfire" },
  { type: "photo", topic: "sauna" },
];

export function LocationMissions({ zone }: { zone: AdventureZone }) {
  const [openLocation, setOpenLocation] = useState<string | null>(null);
  const [showMissionPanel, setShowMissionPanel] = useState(false);
  const [expandedMission, setExpandedMission] = useState<number | null>(null);
  const [activeMissionIndex, setActiveMissionIndex] = useState<number | null>(null);
  const [missionProgress, setMissionProgress] = useState<number[]>(
    () => (zone.missions ?? []).map(() => 0)
  );
  const [verifying, setVerifying] = useState(false);
  const [pendingVoteId, setPendingVoteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/adventure/progress?zoneSlug=${zone.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.progress) return;
        setMissionProgress((prev) =>
          prev.map((v, i) => (typeof data.progress[i] === "number" ? Math.min(3, data.progress[i]) : v))
        );
      })
      .catch(() => {});
  }, [zone.slug]);

  useEffect(() => {
    if (!pendingVoteId) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/ruda-vote/${pendingVoteId}`);
        const data = await res.json();
        if (data.status === "APPROVED") {
          clearInterval(timer);
          setPendingVoteId(null);
          if (activeMissionIndex !== null) bumpProgress(activeMissionIndex);
          setHistory((h) => [...h, { role: "ai", text: "루다투표제 심사 결과 통과했다냥! 🎉" }]);
        } else if (data.status === "REJECTED") {
          clearInterval(timer);
          setPendingVoteId(null);
          setHistory((h) => [...h, { role: "ai", text: "루다투표제에서 다수결로 통과하지 못했어냥 😿 다시 도전해봐냥." }]);
        }
      } catch {
        // 다음 폴링에서 재시도
      }
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingVoteId]);

  if (!zone.pathGraph) return null;
  const graph = zone.pathGraph;

  function openMissionChat(index: number) {
    const missionText = zone.missions?.[index] ?? "";
    const verify = MISSION_VERIFY[index];
    setActiveMissionIndex(index);
    setHistory([
      {
        role: "ai",
        text:
          verify?.type === "gps"
            ? `좋아냥! "${missionText}" 미션이야. 진짜 대구(대프리카)에 있어야만 인정해줄게냥 — 아래 버튼으로 GPS 인증해봐냥 📍`
            : `좋아냥! "${missionText}" 미션이야. 위치 권한 허용하고 진짜 현장에서 사진을 찍어서 보여줘야 인정해줄게냥 — GPS로 위치도 같이 확인하고, 애매하면 루다투표제로 넘길게냥 📍📷`,
      },
    ]);
    setInput("");
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || activeMissionIndex === null) return;
    const nextHistory: ChatEntry[] = [...history, { role: "user", text }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-ruda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setHistory((h) => [...h, { role: "ai", text: data.reply ?? "냥...?" }]);
    } catch {
      setHistory((h) => [...h, { role: "ai", text: "냥...! 지금 대답하기 어려운 것 같아." }]);
    } finally {
      setLoading(false);
    }
  }

  function bumpProgress(index: number) {
    setMissionProgress((prev) => {
      const next = [...prev];
      next[index] = Math.min(3, next[index] + 1);
      return next;
    });
  }

  function verifyGps() {
    if (activeMissionIndex === null || verifying) return;
    if (!navigator.geolocation) {
      setHistory((h) => [...h, { role: "ai", text: "이 브라우저에서는 위치 확인이 안 돼냥 😿" }]);
      return;
    }
    setVerifying(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/adventure/verify-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              zoneSlug: zone.slug,
              missionIndex: activeMissionIndex,
            }),
          });
          const data = await res.json();
          if (data.verified) {
            bumpProgress(activeMissionIndex);
            setHistory((h) => [
              ...h,
              { role: "ai", text: `진짜 대구 도착 확인했다냥! 🎉 (${missionProgress[activeMissionIndex] + 1}/3)` },
            ]);
          } else {
            setHistory((h) => [
              ...h,
              { role: "ai", text: `어라, 대구에서 약 ${data.distanceKm}km 떨어져 있는걸냥? 거짓말은 안 돼냥 🐾` },
            ]);
          }
        } catch {
          setHistory((h) => [...h, { role: "ai", text: "위치 인증 중 문제가 생겼어냥." }]);
        } finally {
          setVerifying(false);
        }
      },
      () => {
        setHistory((h) => [...h, { role: "ai", text: "위치 권한을 허용해줘야 인증할 수 있어냥." }]);
        setVerifying(false);
      }
    );
  }

  function triggerPhotoCapture() {
    fileInputRef.current?.click();
  }

  async function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || activeMissionIndex === null) return;
    const topic = MISSION_VERIFY[activeMissionIndex]?.topic;
    if (!topic) return;
    if (!navigator.geolocation) {
      setHistory((h) => [...h, { role: "ai", text: "이 브라우저에서는 위치 확인이 안 돼냥 😿" }]);
      return;
    }

    setVerifying(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const dataUrl: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const res = await fetch("/api/adventure/verify-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic,
              image: dataUrl,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              zoneSlug: zone.slug,
              missionIndex: activeMissionIndex,
            }),
          });
          const data = await res.json();
          if (data.verified) {
            bumpProgress(activeMissionIndex);
            setHistory((h) => [
              ...h,
              { role: "ai", text: `사진 확인했다냥! 진짜 맞네~ 🎉 (${missionProgress[activeMissionIndex] + 1}/3)` },
            ]);
          } else if (data.pending) {
            setPendingVoteId(data.voteId);
            setHistory((h) => [
              ...h,
              {
                role: "ai",
                text: "AI루다가 혼자 판단하기 애매해서 루다투표제에 올렸어냥! 다른 유저들 투표 결과가 나오면 바로 알려줄게냥 🗳️",
              },
            ]);
          } else {
            setHistory((h) => [
              ...h,
              { role: "ai", text: `음... 사진에서 그게 잘 안 보이는걸냥. ${data.reason ?? "다시 찍어줘냥."}` },
            ]);
          }
        } catch {
          setHistory((h) => [...h, { role: "ai", text: "사진 인증 중 문제가 생겼어냥." }]);
        } finally {
          setVerifying(false);
        }
      },
      () => {
        setHistory((h) => [...h, { role: "ai", text: "위치 권한을 허용해줘야 인증할 수 있어냥." }]);
        setVerifying(false);
      }
    );
  }

  const activeVerify = activeMissionIndex !== null ? MISSION_VERIFY[activeMissionIndex] : null;

  return (
    <>
      {LOCATION_IDS.filter((id) => graph.nodes[id]).map((id) => {
        const node = graph.nodes[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => setOpenLocation(id)}
            className="group absolute h-[8%] w-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-110"
            style={{ top: node.top, left: node.left }}
          >
            <span className="sr-only">{node.label}</span>
            <span className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-amber-300/80" />
          </button>
        );
      })}

      {openLocation && graph.nodes[openLocation] && (
        <div
          className="absolute z-20 flex -translate-x-1/2 flex-col items-center gap-1"
          style={{ top: graph.nodes[openLocation].top, left: graph.nodes[openLocation].left, marginTop: "3%" }}
        >
          <span className="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">🔒</span>
          <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/80 px-3 py-2 text-center shadow-xl">
            <p className="text-xs font-bold text-amber-300">{graph.nodes[openLocation].label}</p>
            <p className="text-[11px] text-white">미션을 클리어해야 열립니다</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowMissionPanel(true)}
                className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-white hover:bg-amber-600"
              >
                미션 확인
              </button>
              <button
                onClick={() => setOpenLocation(null)}
                className="rounded-full bg-white/20 px-2 py-1 text-[11px] text-white hover:bg-white/30"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showMissionPanel && (
        <div
          className="fixed inset-0 z-[350] flex items-center justify-end bg-black/50 p-4"
          onClick={() => {
            setShowMissionPanel(false);
            setExpandedMission(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300">🔥 해금 미션</p>
              <button
                onClick={() => {
                  setShowMissionPanel(false);
                  setExpandedMission(null);
                }}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            {(zone.missions ?? []).map((mission, i) => (
              <div
                key={i}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {i + 1}) {mission}
                  </p>
                  <button
                    onClick={() => setExpandedMission((v) => (v === i ? null : i))}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white hover:bg-amber-600"
                  >
                    {expandedMission === i ? "−" : "+"}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                  진행도 {missionProgress[i]}/3 · {MISSION_VERIFY[i].type === "gps" ? "📍 GPS 인증" : "📍📷 GPS+사진 인증"}
                </p>
                {expandedMission === i && (
                  <button
                    onClick={() => openMissionChat(i)}
                    className="mt-2 w-full rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    🐾 미션 수행하기 (AI루다와 함께)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPhotoSelected}
      />

      {activeMissionIndex !== null && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setActiveMissionIndex(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-sm flex-col rounded-3xl border border-amber-200 bg-white p-5 shadow-2xl dark:border-amber-900 dark:bg-zinc-950"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                🐾 {zone.missions?.[activeMissionIndex]}
              </p>
              <button
                onClick={() => setActiveMissionIndex(null)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <div className="mb-2 flex max-h-60 flex-col gap-2 overflow-y-auto rounded-2xl bg-amber-50/60 p-3 dark:bg-amber-950/10">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                    entry.role === "ai"
                      ? "self-start bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
                      : "self-end bg-amber-600 text-white"
                  }`}
                >
                  {entry.text}
                </div>
              ))}
              {loading && (
                <div className="self-start rounded-2xl bg-white px-3 py-2 text-sm text-amber-400 shadow-sm dark:bg-zinc-900">
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
                placeholder="지금 상황을 말해줘냥"
                className="min-w-0 flex-1 rounded-full border border-amber-200 px-3 py-1.5 text-sm dark:border-amber-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              >
                전송
              </button>
            </div>

            {activeVerify?.type === "gps" ? (
              <button
                onClick={verifyGps}
                disabled={verifying}
                className="mt-2 rounded-full border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                {verifying ? "위치 확인 중..." : "📍 GPS로 실제 위치 인증하기"}
              </button>
            ) : (
              <button
                onClick={triggerPhotoCapture}
                disabled={verifying || pendingVoteId !== null}
                className="mt-2 rounded-full border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                {pendingVoteId
                  ? "🗳️ 루다투표제 심사 대기 중..."
                  : verifying
                    ? "위치+사진 확인 중..."
                    : "📍📷 지금 바로 위치+사진 인증하기"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
