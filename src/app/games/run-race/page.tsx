"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamPicker, type UserHit } from "@/components/TeamPicker";
import { GpsRunTracker } from "@/components/GpsRunTracker";
import { GameResultOverlay } from "@/components/GameResultOverlay";

export default function RunRacePage() {
  const [teamNameA, setTeamNameA] = useState("A팀");
  const [teamNameB, setTeamNameB] = useState("B팀");
  const [teamA, setTeamA] = useState<UserHit[]>([]);
  const [teamB, setTeamB] = useState<UserHit[]>([]);
  const [distanceA, setDistanceA] = useState<number | null>(null);
  const [distanceB, setDistanceB] = useState<number | null>(null);

  const [settling, setSettling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{ winnerLabel: string; message: string } | null>(
    null
  );

  function addTo(team: "A" | "B", user: UserHit) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => (prev.some((m) => m.id === user.id) ? prev : [...prev, user]));
  }
  function removeFrom(team: "A" | "B", id: string) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  async function settle() {
    if (distanceA === null || distanceB === null || distanceA === distanceB) return;
    const winnerIsA = distanceA > distanceB;
    const winningTeam = winnerIsA ? teamA : teamB;
    const winningName = winnerIsA ? teamNameA : teamNameB;
    if (winningTeam.length === 0) {
      setError(`${winningName}에 팀원을 먼저 추가해주세요.`);
      return;
    }
    setSettling(true);
    setError(null);
    const res = await fetch("/api/games/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "RUN_RACE",
        winningTeamUserIds: winningTeam.map((m) => m.id),
      }),
    });
    const data = await res.json();
    setSettling(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setPendingResult({
      winnerLabel: winningName,
      message: `🏆 ${winningName} 승리! ${data.rewarded}명에게 EXP +0.2, 젤리 +2 지급했어요.`,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          실시간 여행게임 대전
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">거리 달리기</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          같은 기기를 팀별로 들고 20초 동안 달려서 GPS로 측정된 실제 이동거리로 승부해요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <TeamPicker
            teamName={teamNameA}
            onTeamNameChange={setTeamNameA}
            members={teamA}
            onAdd={(u) => addTo("A", u)}
            onRemove={(id) => removeFrom("A", id)}
          />
          <GpsRunTracker label={teamNameA} distance={distanceA} onFinished={setDistanceA} />
        </div>
        <div className="flex flex-col gap-3">
          <TeamPicker
            teamName={teamNameB}
            onTeamNameChange={setTeamNameB}
            members={teamB}
            onAdd={(u) => addTo("B", u)}
            onRemove={(id) => removeFrom("B", id)}
          />
          <GpsRunTracker label={teamNameB} distance={distanceB} onFinished={setDistanceB} />
        </div>
      </div>

      <button
        type="button"
        onClick={settle}
        disabled={distanceA === null || distanceB === null || distanceA === distanceB || settling}
        className="self-center rounded-full bg-amber-600 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
      >
        {settling
          ? "정산 중..."
          : distanceA !== null && distanceB !== null && distanceA === distanceB
            ? "거리가 같아요 (무승부)"
            : "🏁 결과 정산하기"}
      </button>

      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">❌ {error}</p>}
      {result && (
        <div className="rounded-2xl border border-green-300 bg-green-50 p-5 text-center text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
          {result}
        </div>
      )}

      <div className="flex justify-center">
        <Link
          href="/home"
          className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400"
        >
          ← 루다월드 홈으로
        </Link>
      </div>

      {pendingResult && (
        <GameResultOverlay
          winnerLabel={pendingResult.winnerLabel}
          onClose={() => {
            setResult(pendingResult.message);
            setPendingResult(null);
          }}
        />
      )}
    </div>
  );
}
