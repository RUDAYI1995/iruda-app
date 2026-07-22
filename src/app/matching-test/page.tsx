"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudBackground } from "@/components/CloudLayer";
import { CabinExplorer } from "@/components/CabinExplorer";

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Phase = "searching" | "ready-check" | "launching";

export default function MatchingTestPage() {
  const [elapsed, setElapsed] = useState(0);
  const [foundCount, setFoundCount] = useState(1);
  const [phase, setPhase] = useState<Phase>("searching");
  const [readyStates, setReadyStates] = useState([false, false, false, false]);

  useEffect(() => {
    if (phase !== "searching") return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "searching" || foundCount >= 4) return;
    const t = setTimeout(() => setFoundCount((c) => c + 1), 2500 + Math.random() * 2000);
    return () => clearTimeout(t);
  }, [phase, foundCount]);

  useEffect(() => {
    if (foundCount >= 4 && phase === "searching") {
      setPhase("ready-check");
    }
  }, [foundCount, phase]);

  // 나 이외 동료 3명은 자동으로 하나씩 준비 완료 처리 (데모용)
  useEffect(() => {
    if (phase !== "ready-check") return;
    const nextIdx = readyStates.findIndex((r, i) => i > 0 && !r);
    if (nextIdx === -1) return;
    const t = setTimeout(() => {
      setReadyStates((rs) => rs.map((r, i) => (i === nextIdx ? true : r)));
    }, 1200 + Math.random() * 1500);
    return () => clearTimeout(t);
  }, [phase, readyStates]);

  useEffect(() => {
    if (phase === "ready-check" && readyStates.every(Boolean)) {
      const t = setTimeout(() => setPhase("launching"), 500);
      return () => clearTimeout(t);
    }
  }, [phase, readyStates]);

  const handleMeReady = () => {
    setReadyStates((rs) => rs.map((r, i) => (i === 0 ? true : r)));
  };

  const resetDemo = () => {
    setElapsed(0);
    setFoundCount(1);
    setReadyStates([false, false, false, false]);
    setPhase("searching");
  };

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-50 py-16">
      <CloudBackground />

      {phase === "launching" && (
        <div className="animate-cloud-immerse absolute inset-0 z-20 bg-white" />
      )}

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <p className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-sky-700">
          독립 데모 (로그인/실제 정모 데이터와 무관)
        </p>

        <div className="relative flex flex-col items-center">
          <div
            className={phase === "launching" ? "animate-plane-launch" : "animate-plane-bob"}
            style={{ fontSize: "9rem" }}
          >
            {phase === "launching" ? "🛩️" : "✈️"}
          </div>
          {phase !== "launching" && (
            <div
              className="animate-plane-trail absolute -left-16 top-1/2 h-1 w-20 origin-right rounded-full bg-white/70"
              style={{ animationDuration: "1.4s", animationIterationCount: "infinite" }}
            />
          )}
        </div>

        {phase === "searching" && (
          <div className="rounded-3xl bg-white/80 px-8 py-6 shadow-lg backdrop-blur">
            <p className="mb-1 text-sm font-medium text-sky-700">
              여행 동료를 찾고 있어요
            </p>
            <p className="mb-4 text-3xl font-bold tabular-nums text-sky-900">
              {formatElapsed(elapsed)}
            </p>
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all ${
                    i < foundCount
                      ? "scale-100 bg-sky-500 text-white"
                      : "scale-90 bg-sky-100 text-sky-300"
                  }`}
                >
                  {i < foundCount ? "🧳" : "?"}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-sky-600">
              {foundCount}/4명 탑승 준비 완료
            </p>
          </div>
        )}

        {phase === "ready-check" && (
          <div className="w-full max-w-sm rounded-3xl bg-white/85 px-8 py-6 shadow-lg backdrop-blur">
            <p className="mb-1 text-lg font-bold text-sky-900">전원 매칭 완료!</p>
            <p className="mb-4 text-sm text-sky-700">
              다 같이 준비되면 출발할 수 있어요
            </p>
            <ul className="mb-5 flex flex-col gap-2">
              {readyStates.map((ready, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-2 text-sm"
                >
                  <span className="text-sky-900">
                    동료 {i + 1} {i === 0 && "(나)"}
                  </span>
                  <span className={ready ? "text-emerald-600" : "text-sky-400"}>
                    {ready ? "✓ 준비완료" : "대기 중"}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleMeReady}
              disabled={readyStates[0]}
              className="w-full rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
            >
              {readyStates[0] ? "OK 누름 ✓" : "OK"}
            </button>
          </div>
        )}

        {phase === "launching" && (
          <p className="text-lg font-semibold text-sky-800">이륙 중... 🛫</p>
        )}

        {phase !== "launching" && (
          <CabinExplorer
            waitingCount={
              phase === "searching" ? Math.max(0, foundCount - 1) : readyStates.length - 1
            }
            chaseActive={phase === "ready-check"}
          />
        )}

        {phase === "launching" ? (
          <button
            onClick={resetDemo}
            className="rounded-full border border-sky-400/40 bg-white/60 px-6 py-2.5 text-sm font-medium text-sky-800 backdrop-blur transition-colors hover:bg-white/90"
          >
            다시 테스트하기
          </button>
        ) : (
          <Link
            href="/"
            className="rounded-full border border-sky-400/40 bg-white/60 px-6 py-2.5 text-sm font-medium text-sky-800 backdrop-blur transition-colors hover:bg-white/90"
          >
            매칭 취소
          </Link>
        )}
      </div>
    </div>
  );
}
