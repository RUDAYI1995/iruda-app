"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DUNGEON_STAGES } from "@/lib/assaDungeon";

export default function AssaDungeonPage() {
  const [cleared, setCleared] = useState<number[]>([]);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [pendingVoteId, setPendingVoteId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadProgress() {
    const res = await fetch("/api/assa-dungeon/progress");
    const data = await res.json();
    setCleared(data.clearedStages ?? []);
  }

  useEffect(() => {
    const init = async () => {
      await loadProgress();
    };
    init();
  }, []);

  useEffect(() => {
    if (!pendingVoteId) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/ruda-vote/${pendingVoteId}`);
      const data = await res.json();
      if (data.status === "APPROVED") {
        clearInterval(timer);
        setPendingVoteId(null);
        setMessage("🗳️ 루다투표제 심사 통과! 마일리지 +100, EXP +0.4 받았어요 🎉");
        loadProgress();
      } else if (data.status === "REJECTED") {
        clearInterval(timer);
        setPendingVoteId(null);
        setMessage("🗳️ 루다투표제에서 다수결로 통과하지 못했어요. 다시 도전해봐요.");
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [pendingVoteId]);

  function startVerify(stageIndex: number) {
    setActiveStage(stageIndex);
    setMessage(null);
    fileInputRef.current?.click();
  }

  async function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || activeStage === null) return;
    if (!navigator.geolocation) {
      setMessage("이 브라우저에서는 위치 확인이 안 돼요 😿");
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

          const res = await fetch("/api/assa-dungeon/verify-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stageIndex: activeStage,
              image: dataUrl,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          const data = await res.json();
          if (data.verified) {
            setMessage(
              data.alreadyCleared
                ? "이미 클리어한 스테이지예요 🐾"
                : `🎉 인증 성공! 마일리지 +${data.mileageGained}, EXP +${data.expGained} 획득했어요!`
            );
            loadProgress();
          } else if (data.pending) {
            setPendingVoteId(data.voteId);
            setMessage("AI루다가 혼자 판단하기 애매해서 루다투표제에 올렸어요 🗳️ 결과가 나오면 알려드릴게요.");
          } else {
            setMessage(`음... 사진에서 잘 안 보여요. ${data.reason ?? "다시 찍어주세요."}`);
          }
        } catch {
          setMessage("인증 중 문제가 생겼어요.");
        } finally {
          setVerifying(false);
        }
      },
      () => {
        setMessage("위치 권한을 허용해야 인증할 수 있어요.");
        setVerifying(false);
      }
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div
        className="relative overflow-hidden rounded-3xl border border-slate-700 shadow-2xl"
        style={{
          backgroundImage: "url(/assa-dungeon-bg.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#000",
          aspectRatio: "1536 / 1024",
        }}
      >
        <div className="flex h-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
          <p className="text-sm font-bold text-slate-200">🕳️ 아싸던전 · 🧍 솔플 퀘스트</p>
          <h1 className="text-3xl font-extrabold text-white drop-shadow">
            혼자서도 씩씩하게, 한 걸음씩
          </h1>
        </div>
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        위대한 모험이 파티전용 퀘스트라면, 아싸던전은 혼자서도 깰 수 있는 <b>솔플 전용 퀘스트</b>예요.
        각 층의 현실 미션을 실제로 수행하고 위치+사진으로 인증하면 마일리지 +100, EXP +0.4를 받아요.
        AI가 판단하기 애매하면 루다투표제로 넘어가요.
      </p>

      <div className="flex flex-col gap-3">
        {DUNGEON_STAGES.map((stage) => {
          const isCleared = cleared.includes(stage.index);
          return (
            <div
              key={stage.index}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm ${
                isCleared
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                  : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
              }`}
            >
              <div>
                <p className="font-bold text-zinc-900 dark:text-zinc-50">
                  {stage.index + 1}층 · {stage.name} {isCleared && "✅"}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{stage.flavor}</p>
                <p className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                  🎯 현실 미션: {stage.realMission}
                </p>
              </div>
              <button
                type="button"
                disabled={isCleared || verifying || pendingVoteId !== null}
                onClick={() => startVerify(stage.index)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow disabled:opacity-50 ${
                  isCleared
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-slate-800 text-white hover:scale-105 dark:bg-slate-100 dark:text-slate-900"
                }`}
              >
                {isCleared ? "클리어 완료" : verifying ? "확인 중..." : "📍📷 위치+사진 인증하기"}
              </button>
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPhotoSelected}
      />

      {message && (
        <p className="rounded-2xl bg-amber-50 p-3 text-center text-sm font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
          {message}
        </p>
      )}

      <div className="flex justify-center">
        <Link href="/home" className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400">
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
