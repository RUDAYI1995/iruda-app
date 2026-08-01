"use client";

import { useEffect, useState } from "react";
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

  const [settling, setSettling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{ winnerLabel: string; message: string } | null>(
    null
  );
  const [voteId, setVoteId] = useState<string | null>(null);

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

  async function submitToRudaVote() {
    if (teamA.length === 0 || teamB.length === 0) {
      setError("양 팀에 팀원을 먼저 추가해주세요.");
      return;
    }
    if (!photoA || !photoB) {
      setError("양 팀 사진을 먼저 찍어주세요.");
      return;
    }
    setSettling(true);
    setError(null);
    const res = await fetch("/api/games/face-off/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamNameA,
        teamNameB,
        photoA,
        photoB,
        teamAUserIds: teamA.map((m) => m.id),
        teamBUserIds: teamB.map((m) => m.id),
      }),
    });
    const data = await res.json();
    setSettling(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setVoteId(data.voteId);
  }

  useEffect(() => {
    if (!voteId) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/ruda-vote/${voteId}`);
      const data = await res.json();
      if (data.status === "APPROVED" || data.status === "REJECTED") {
        clearInterval(timer);
        const winnerLabel = data.status === "APPROVED" ? teamNameA || teamNameB : "판정 종료";
        setPendingResult({
          winnerLabel,
          message: "🗳️ 루다투표제 투표가 마감돼서 승리 팀에 EXP/젤리 지급과 랭킹 반영이 끝났어요!",
        });
        setVoteId(null);
        setPhotoA(null);
        setPhotoB(null);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [voteId, teamNameA, teamNameB]);

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

      <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-center dark:border-red-700 dark:bg-red-950/20">
        <h3 className="mb-3 font-bold text-black dark:text-white">🗳️ 판정은 루다투표제에서!</h3>
        <p className="mb-4 text-sm font-medium text-black dark:text-white">
          양 팀 사진을 찍고 나면 루다투표제에 올라가요. 다른 유저 3명이 투표하면 자동으로 승리 팀이 확정되고
          EXP/젤리가 지급돼요.
        </p>
        {voteId ? (
          <p className="font-bold text-black dark:text-white">🗳️ 투표 진행 중... 결과를 기다리는 중이에요.</p>
        ) : (
          <button
            type="button"
            disabled={settling}
            onClick={submitToRudaVote}
            className="rounded-full bg-red-500 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
          >
            {settling ? "올리는 중..." : "🗳️ 루다투표제에 올리기"}
          </button>
        )}
        <div className="mt-3">
          <Link href="/ruda-vote" className="text-xs font-semibold text-black underline dark:text-white">
            루다투표제 바로가기 →
          </Link>
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
