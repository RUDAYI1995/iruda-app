"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamPicker, type UserHit } from "@/components/TeamPicker";
import { GameResultOverlay } from "@/components/GameResultOverlay";

interface Checkpoint {
  id: string;
  name: string;
}

export default function VisitRacePage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkpointId, setCheckpointId] = useState("");

  const [teamNameA, setTeamNameA] = useState("A팀");
  const [teamNameB, setTeamNameB] = useState("B팀");
  const [teamA, setTeamA] = useState<UserHit[]>([]);
  const [teamB, setTeamB] = useState<UserHit[]>([]);

  const [raceStarted, setRaceStarted] = useState(false);
  const [winnerLabel, setWinnerLabel] = useState<"A" | "B" | null>(null);
  const [settling, setSettling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{ winnerLabel: string; message: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/quest/checkpoints")
      .then((res) => res.json())
      .then((data: Checkpoint[]) => setCheckpoints(data));
  }, []);

  function addTo(team: "A" | "B", user: UserHit) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => (prev.some((m) => m.id === user.id) ? prev : [...prev, user]));
  }
  function removeFrom(team: "A" | "B", id: string) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  function startRace() {
    setWinnerLabel(null);
    setResult(null);
    setError(null);
    setRaceStarted(true);
  }

  async function arrive(side: "A" | "B") {
    if (winnerLabel) return; // 이미 도착팀이 정해졌으면 무시 — 같은 순간의 두 클릭 중 먼저 처리된 쪽만 승리
    setWinnerLabel(side);

    const winningTeam = side === "A" ? teamA : teamB;
    const winningName = side === "A" ? teamNameA : teamNameB;
    if (winningTeam.length === 0) {
      setError(`${winningName}에 팀원을 먼저 추가해주세요.`);
      return;
    }
    setSettling(true);
    const res = await fetch("/api/games/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "VISIT_RACE",
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
      message: `🏁 ${winningName} 먼저 도착! ${data.rewarded}명에게 EXP +0.2, 젤리 +2 지급했어요.`,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          실시간 여행게임 대전
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">방문인증 대결</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          지정된 여행 인증 지점에 먼저 도착해서 &ldquo;도착!&rdquo;을 누른 팀이 승리해요.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          목표 지점 (여행 인증 퀘스트에 등록된 지점 중 선택)
        </label>
        <select
          value={checkpointId}
          onChange={(e) => setCheckpointId(e.target.value)}
          disabled={raceStarted}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">지점을 선택해주세요</option>
          {checkpoints.map((cp) => (
            <option key={cp.id} value={cp.id}>
              {cp.name}
            </option>
          ))}
        </select>
        {checkpoints.length === 0 && (
          <p className="mt-2 text-xs text-zinc-400">
            등록된 지점이 없어요.{" "}
            <Link href="/quest" className="underline">
              여행 인증 퀘스트
            </Link>
            에서 먼저 등록해주세요.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TeamPicker
          teamName={teamNameA}
          onTeamNameChange={setTeamNameA}
          members={teamA}
          onAdd={(u) => addTo("A", u)}
          onRemove={(id) => removeFrom("A", id)}
        />
        <TeamPicker
          teamName={teamNameB}
          onTeamNameChange={setTeamNameB}
          members={teamB}
          onAdd={(u) => addTo("B", u)}
          onRemove={(id) => removeFrom("B", id)}
        />
      </div>

      {!raceStarted ? (
        <button
          type="button"
          onClick={startRace}
          disabled={!checkpointId}
          className="self-center rounded-full bg-zinc-900 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
        >
          🏁 경주 시작!
        </button>
      ) : (
        <div className="flex justify-center gap-6">
          <button
            type="button"
            onClick={() => arrive("A")}
            disabled={!!winnerLabel || settling}
            className="rounded-full bg-amber-600 px-8 py-4 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
          >
            {teamNameA} 도착!
          </button>
          <button
            type="button"
            onClick={() => arrive("B")}
            disabled={!!winnerLabel || settling}
            className="rounded-full bg-amber-600 px-8 py-4 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
          >
            {teamNameB} 도착!
          </button>
        </div>
      )}

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
