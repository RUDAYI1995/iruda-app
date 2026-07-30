"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamPicker, type UserHit } from "@/components/TeamPicker";
import { CountdownCamera } from "@/components/CountdownCamera";
import { GameResultOverlay } from "@/components/GameResultOverlay";

export default function FaceOffPage() {
  const [expression, setExpression] = useState<string | null>(null);
  const [loadingExpression, setLoadingExpression] = useState(false);

  const [teamNameA, setTeamNameA] = useState("A팀");
  const [teamNameB, setTeamNameB] = useState("B팀");
  const [teamA, setTeamA] = useState<UserHit[]>([]);
  const [teamB, setTeamB] = useState<UserHit[]>([]);
  const [photoA, setPhotoA] = useState<string | null>(null);
  const [photoB, setPhotoB] = useState<string | null>(null);
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);

  const [settling, setSettling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{ winnerLabel: string; message: string } | null>(
    null
  );

  async function getExpression() {
    setLoadingExpression(true);
    setResult(null);
    setError(null);
    const res = await fetch("/api/games/face-off/prompt");
    const data = await res.json();
    setExpression(data.expression);
    setLoadingExpression(false);
  }

  function addTo(team: "A" | "B", user: UserHit) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => (prev.some((m) => m.id === user.id) ? prev : [...prev, user]));
  }
  function removeFrom(team: "A" | "B", id: string) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSettle(winner: "A" | "B") {
    const winningTeam = winner === "A" ? teamA : teamB;
    const winningName = winner === "A" ? teamNameA : teamNameB;
    if (winningTeam.length === 0) {
      setError("승리 팀에 팀원을 먼저 추가해주세요.");
      return;
    }
    setSettling(true);
    setError(null);
    const res = await fetch("/api/games/face-off/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winningTeamUserIds: winningTeam.map((m) => m.id) }),
    });
    const data = await res.json();
    setSettling(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setPendingResult({
      winnerLabel: winningName,
      message: `🏆 ${winningName} 승리! ${data.rewarded}명에게 EXP +0.2, 젤리 +10000 지급하고 "이번달 최고의 연극상" 순위에 반영했어요.`,
    });
    setVotesA(0);
    setVotesB(0);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          실시간 여행게임 대전
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">표정짓기 대결</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          AI루다가 표정 미션을 내리면, &ldquo;자 사진 찍는다냥! 3! 2! 1! 치이즈!&rdquo; 카운트다운이 끝나는
          순간 자동으로 촬영돼요 — 촬영 타이밍은 사람이 정하지 않아서 공정해요.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
        {expression ? (
          <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-300">
            🎭 {expression}
          </p>
        ) : (
          <p className="text-zinc-500">아직 표정 미션이 없어요.</p>
        )}
        <button
          type="button"
          onClick={getExpression}
          disabled={loadingExpression}
          className="mt-4 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {loadingExpression ? "AI루다가 고민 중..." : "🎲 AI루다에게 표정 미션 받기"}
        </button>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <CountdownCamera label={`${teamNameA} 표정`} photo={photoA} onCaptured={setPhotoA} />
        <CountdownCamera label={`${teamNameB} 표정`} photo={photoB} onCaptured={setPhotoB} />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <h3 className="mb-3 text-center font-bold text-amber-900 dark:text-amber-200">
          🗳️ 참가자 판정 투표
        </h3>
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setVotesA((v) => v + 1)}
              className="rounded-full bg-white px-6 py-3 text-lg font-bold shadow hover:scale-105 dark:bg-zinc-900"
            >
              {teamNameA}에 투표
            </button>
            <span className="text-2xl font-extrabold text-amber-800 dark:text-amber-300">
              {votesA}
            </span>
          </div>
          <span className="text-xl font-bold text-zinc-400">VS</span>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setVotesB((v) => v + 1)}
              className="rounded-full bg-white px-6 py-3 text-lg font-bold shadow hover:scale-105 dark:bg-zinc-900"
            >
              {teamNameB}에 투표
            </button>
            <span className="text-2xl font-extrabold text-amber-800 dark:text-amber-300">
              {votesB}
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            disabled={settling || votesA === votesB}
            onClick={() => handleSettle(votesA > votesB ? "A" : "B")}
            className="rounded-full bg-amber-600 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
          >
            {settling
              ? "정산 중..."
              : votesA === votesB
                ? "투표가 동점이에요"
                : `투표 마감하고 ${votesA > votesB ? teamNameA : teamNameB} 승리 확정`}
          </button>
        </div>
      </div>

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
