"use client";

import { useRef, useState } from "react";
import { haversineDistanceMeters } from "@/lib/geo";

const RUN_SECONDS = 20;

export function GpsRunTracker({
  label,
  distance,
  onFinished,
}: {
  label: string;
  distance: number | null;
  onFinished: (meters: number) => void;
}) {
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RUN_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const totalRef = useRef(0);

  async function start() {
    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 정보를 지원하지 않아요");
      return;
    }
    setError(null);
    for (const step of ["3", "2", "1", "출발!"]) {
      setCountdown(step);
      await new Promise((r) => setTimeout(r, 700));
    }
    setCountdown(null);

    totalRef.current = 0;
    lastPosRef.current = null;
    setRunning(true);
    setSecondsLeft(RUN_SECONDS);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (lastPosRef.current) {
          totalRef.current += haversineDistanceMeters(
            lastPosRef.current.lat,
            lastPosRef.current.lng,
            latitude,
            longitude
          );
        }
        lastPosRef.current = { lat: latitude, lng: longitude };
      },
      () => setError("위치를 가져올 수 없어요"),
      { enableHighAccuracy: true }
    );

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
          setRunning(false);
          onFinished(Math.round(totalRef.current));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{label}</h3>
      <div className="text-3xl">🏃</div>
      {running ? (
        <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
          남은 시간 {secondsLeft}초
        </p>
      ) : distance !== null ? (
        <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{distance}m 이동!</p>
      ) : (
        <p className="text-sm text-zinc-400">아직 측정 전이에요</p>
      )}
      {countdown && (
        <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-300">{countdown}</p>
      )}
      <button
        type="button"
        onClick={start}
        disabled={running}
        className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {running ? "측정 중..." : distance !== null ? "다시 측정" : `🎬 ${RUN_SECONDS}초 달리기 시작`}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
