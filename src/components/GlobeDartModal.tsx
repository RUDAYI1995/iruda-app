"use client";

import { useState } from "react";
import { DART_DESTINATIONS, pickRandomDestination, type DartDestination } from "@/lib/dartDestinations";
import { Portal } from "@/components/Portal";

type Phase = "idle" | "throwing" | "result" | "confirming" | "saved";

// 지구본 이미지의 원형(지구본) 부분만 잘라서 계속 빙빙 도는 애니메이션으로 보여주는 크롭 영역.
// dart-globe.png(1086x1448) 안에서 실측한 지구본 위치를 %로 지정.
const GLOBE_CROP = { top: 6, left: 29, width: 67, height: 52 };

export function GlobeDartModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [dartPos, setDartPos] = useState({ x: 50, y: 50 });
  const [destination, setDestination] = useState<DartDestination | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function throwDart() {
    if (phase === "throwing") return;
    setPhase("throwing");
    setSavedMessage(null);

    // 당첨지를 먼저 뽑고, 다트는 그 지역의 실제 라벨 위치(지구본 원 기준 상대 좌표)에
    // 정확히 꽂히도록 좌표를 GLOBE_CROP 기준 전체 이미지 %로 변환함
    const picked = pickRandomDestination();
    setDestination(picked);
    setDartPos({
      x: GLOBE_CROP.left + (picked.x / 100) * GLOBE_CROP.width,
      y: GLOBE_CROP.top + (picked.y / 100) * GLOBE_CROP.height,
    });

    setTimeout(() => {
      setPhase("result");
    }, 900);
  }

  async function confirmYes() {
    if (!destination) return;
    setSaving(true);
    try {
      const res = await fetch("/api/travel-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: `${destination.city}, ${destination.country}` }),
      });
      const data = await res.json();
      setSavedMessage(
        res.ok
          ? data.scope === "party"
            ? `🎉 파티 전체의 새로운 여행목표지로 저장했어요! 루다알림제에도 기록해뒀어요.`
            : `🎉 내 새로운 여행목표지로 저장했어요! 루다알림제에도 기록해뒀어요.`
          : data.error ?? "저장에 실패했어요"
      );
      setPhase("saved");
    } finally {
      setSaving(false);
    }
  }

  function throwAgain() {
    setPhase("idle");
    setDestination(null);
    setSavedMessage(null);
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-y-auto rounded-3xl bg-[#f5ecd8] p-4 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-amber-800 shadow-md hover:bg-white"
          aria-label="닫기"
        >
          ✕
        </button>

        <div className="relative mx-auto w-full" style={{ aspectRatio: "1086 / 1448" }}>
          <div
            className="absolute inset-0 rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: "url(/dart-globe.png)" }}
          />

          {/* 지구본 원 부분만 빙빙 도는 애니메이션 */}
          <div
            className="absolute overflow-hidden rounded-full"
            style={{
              top: `${GLOBE_CROP.top}%`,
              left: `${GLOBE_CROP.left}%`,
              width: `${GLOBE_CROP.width}%`,
              height: `${GLOBE_CROP.height}%`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url(/dart-globe.png)",
                backgroundSize: `${(100 / GLOBE_CROP.width) * 100}% ${(100 / GLOBE_CROP.height) * 100}%`,
                backgroundPosition: `${(100 * GLOBE_CROP.left) / (100 - GLOBE_CROP.width)}% ${
                  (100 * GLOBE_CROP.top) / (100 - GLOBE_CROP.height)
                }%`,
                animation:
                  phase === "throwing"
                    ? "orbit-spin 0.9s linear infinite"
                    : phase === "idle"
                    ? "orbit-spin 10s linear infinite"
                    : "none",
              }}
            />
          </div>

          {(phase === "throwing" || phase === "result" || phase === "confirming" || phase === "saved") && (
            <div
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-2xl transition-all duration-700 ease-out"
              style={{ left: `${dartPos.x}%`, top: `${dartPos.y}%` }}
            >
              {(phase === "result" || phase === "confirming" || phase === "saved") && (
                <span className="absolute h-9 w-9 animate-ping rounded-full bg-red-500/60" />
              )}
              <span className="relative">🎯</span>
            </div>
          )}
        </div>

        {phase === "idle" && (
          <button
            type="button"
            onClick={throwDart}
            className="mx-auto mt-4 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
          >
            🎯 다트 던지기
          </button>
        )}

        {phase === "throwing" && (
          <p className="mt-4 text-center text-sm font-semibold text-amber-800">다트가 날아가는 중...</p>
        )}

        {phase === "result" && destination && (
          <div className="mt-4 rounded-2xl bg-white/90 p-4 text-center shadow-inner">
            <p className="mb-1 text-lg font-extrabold text-blue-600">🎉 당첨!</p>
            <p className="mb-3 text-xl font-bold text-zinc-900">
              {destination.city}, {destination.country}
            </p>
            <p className="mb-3 text-sm text-zinc-600">이 곳을 여행하시겠습니까?</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={confirmYes}
                className="rounded-full bg-blue-600 px-5 py-1.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? "저장 중..." : "YES"}
              </button>
              <button
                type="button"
                onClick={throwAgain}
                className="rounded-full border border-zinc-300 px-5 py-1.5 text-sm font-bold text-zinc-700"
              >
                NO
              </button>
            </div>
          </div>
        )}

        {phase === "saved" && (
          <div className="mt-4 rounded-2xl bg-white/90 p-4 text-center shadow-inner">
            <p className="text-sm font-semibold text-blue-700">{savedMessage}</p>
            <button
              type="button"
              onClick={throwAgain}
              className="mt-3 rounded-full border border-blue-300 px-4 py-1.5 text-xs font-semibold text-blue-700"
            >
              다시 던지기
            </button>
          </div>
        )}

        <p className="mt-3 text-center text-[10px] text-zinc-400">
          후보 여행지 {DART_DESTINATIONS.length}곳 중 무작위로 골라드려요
        </p>
      </div>
    </div>
    </Portal>
  );
}
