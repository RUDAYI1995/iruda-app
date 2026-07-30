"use client";

import { useRef, useState } from "react";

export function CountdownCamera({
  label,
  photo,
  onCaptured,
}: {
  label: string;
  photo: string | null;
  onCaptured: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [tick, setTick] = useState<string | null>(null); // "3" | "2" | "1" | "치이즈!"
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    } catch {
      setError("카메라 권한을 허용해주셔야 촬영할 수 있어요.");
      return;
    }

    setActive(true);
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      await video.play();
    }

    const steps = ["3", "2", "1", "치이즈!"];
    for (const step of steps) {
      setTick(step);
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    // "치이즈!"가 뜬 바로 그 순간 프레임을 캡처 — 촬영 타이밍을 사람이 아닌 AI루다 카운트다운이 정하기 때문에 공정해요
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      onCaptured(canvas.toDataURL("image/jpeg", 0.85));
    }

    stream.getTracks().forEach((t) => t.stop());
    setActive(false);
    setTick(null);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{label}</h3>

      <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
        {active ? (
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        ) : photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`${label} 표정`} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🤳</span>
        )}
        {tick && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-3xl font-extrabold text-white">
            {tick}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={start}
        disabled={active}
        className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {active ? "촬영 중..." : photo ? "다시 촬영" : "🎬 AI루다 카운트다운 촬영"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
