"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Checkpoint {
  id: string;
  name: string;
  description: string | null;
  radiusMeters: number;
  isOverseas: boolean;
  createdByName: string;
  verifiedByMe: boolean;
}

function resizeImageToDataUrl(file: File, maxWidth = 640, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas 실패"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저는 위치 정보를 지원하지 않아요"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export default function QuestPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationSet, setLocationSet] = useState<{ lat: number; lng: number } | null>(null);
  const [isOverseas, setIsOverseas] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  async function loadCheckpoints() {
    const res = await fetch("/api/quest/checkpoints");
    if (res.ok) setCheckpoints(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadCheckpoints();
  }, []);

  async function handleSetLocation() {
    try {
      const pos = await getCurrentPosition();
      setLocationSet({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setMessage("📍 현재 위치가 설정됐어요!");
    } catch {
      setMessage("⚠️ 위치 권한을 허용해주셔야 설정할 수 있어요.");
    }
  }

  async function handleCreate() {
    if (!name.trim() || !locationSet) return;
    setCreating(true);
    setMessage(null);
    const res = await fetch("/api/quest/checkpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        lat: locationSet.lat,
        lng: locationSet.lng,
        isOverseas,
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setMessage(`❌ ${data.error}`);
      return;
    }
    setName("");
    setDescription("");
    setLocationSet(null);
    setIsOverseas(false);
    setMessage("✅ 여행 코스 지점이 추가됐어요!");
    loadCheckpoints();
  }

  async function handleVerifyPhoto(checkpointId: string, file: File) {
    setVerifyingId(checkpointId);
    setMessage(null);
    try {
      const [photoDataUrl, pos] = await Promise.all([
        resizeImageToDataUrl(file),
        getCurrentPosition(),
      ]);
      const res = await fetch(`/api/quest/checkpoints/${checkpointId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoDataUrl,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${data.error}`);
      } else if (data.alreadyDone) {
        setMessage("이미 인증을 완료한 지점이에요!");
      } else if (data.verified) {
        setMessage(`🎉 인증 성공! (거리 ${data.distanceMeters}m) 마일리지가 쌓였어요!`);
      } else {
        setMessage(
          `📍 아직 그 장소가 아닌 것 같아요. 목표 지점에서 ${data.distanceMeters}m 떨어져 있어요 (인증 반경 ${data.radiusMeters}m).`
        );
      }
      loadCheckpoints();
    } catch {
      setMessage("⚠️ 위치 또는 사진을 확인하는 중 문제가 생겼어요.");
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          소심한 사람들을 위한
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">여행 인증 퀘스트</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          여행 코스에 들르는 곳을 등록하고, 실제로 그곳에서 사진을 찍어 인증해보세요!
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
          새 여행 지점 등록
        </h2>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="지점 이름 (예: 경복궁)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={handleSetLocation}
            className={`self-start rounded-full border px-4 py-1.5 text-sm font-medium ${
              locationSet
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            📍 {locationSet ? "현재 위치 설정됨" : "현재 위치로 설정"}
          </button>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isOverseas}
              onChange={(e) => setIsOverseas(e.target.checked)}
            />
            해외 지점이에요 (해외 방문 EXP 지급)
          </label>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || !locationSet || creating}
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {creating ? "등록 중..." : "지점 등록하기"}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">등록된 지점</h2>
        {loading ? (
          <p className="text-sm text-zinc-500">불러오는 중...</p>
        ) : checkpoints.length === 0 ? (
          <p className="text-sm text-zinc-500">아직 등록된 지점이 없어요.</p>
        ) : (
          checkpoints.map((cp) => (
            <div
              key={cp.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div>
                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                  {cp.isOverseas ? "🌏" : "🇰🇷"} {cp.name}{" "}
                  {cp.verifiedByMe && <span className="ml-1 text-green-600">✅</span>}
                </p>
                {cp.description && (
                  <p className="text-sm text-zinc-500">{cp.description}</p>
                )}
                <p className="text-xs text-zinc-400">
                  등록: {cp.createdByName} · 인증 반경 {cp.radiusMeters}m
                </p>
              </div>
              <label className="shrink-0 cursor-pointer rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700">
                {verifyingId === cp.id ? "확인 중..." : cp.verifiedByMe ? "재인증" : "📷 사진 인증"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={verifyingId === cp.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVerifyPhoto(cp.id, file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center">
        <Link
          href="/home"
          className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400"
        >
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
