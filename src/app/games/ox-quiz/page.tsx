"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamPicker, type UserHit } from "@/components/TeamPicker";
import { GameResultOverlay } from "@/components/GameResultOverlay";

export default function OxQuizPage() {
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<"O" | "X" | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [teamNameA, setTeamNameA] = useState("A팀");
  const [teamNameB, setTeamNameB] = useState("B팀");
  const [teamA, setTeamA] = useState<UserHit[]>([]);
  const [teamB, setTeamB] = useState<UserHit[]>([]);
  const [pickA, setPickA] = useState<"O" | "X" | null>(null);
  const [pickB, setPickB] = useState<"O" | "X" | null>(null);
  const [revealed, setRevealed] = useState(false);

  const [settling, setSettling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{ winnerLabel: string; message: string } | null>(
    null
  );

  async function getQuestion() {
    setLoadingQuestion(true);
    setResult(null);
    setError(null);
    setRevealed(false);
    setPickA(null);
    setPickB(null);
    const res = await fetch("/api/games/ox-quiz/question");
    const data = await res.json();
    setQuestion(data.question);
    setAnswer(data.answer);
    setLoadingQuestion(false);
  }

  function addTo(team: "A" | "B", user: UserHit) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => (prev.some((m) => m.id === user.id) ? prev : [...prev, user]));
  }
  function removeFrom(team: "A" | "B", id: string) {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  async function settleWinners() {
    if (!answer) return;
    const winners: { name: string; team: UserHit[] }[] = [];
    if (pickA === answer) winners.push({ name: teamNameA, team: teamA });
    if (pickB === answer) winners.push({ name: teamNameB, team: teamB });

    if (winners.length === 0) {
      setResult("😅 두 팀 다 틀렸어요! 승자가 없어요.");
      return;
    }
    if (winners.length === 2) {
      setResult("🤝 두 팀 다 맞혔어요! 무승부예요.");
      return;
    }

    const winner = winners[0];
    if (winner.team.length === 0) {
      setError(`${winner.name}에 팀원을 먼저 추가해주세요.`);
      return;
    }
    setSettling(true);
    setError(null);
    const res = await fetch("/api/games/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "OX_QUIZ",
        winningTeamUserIds: winner.team.map((m) => m.id),
      }),
    });
    const data = await res.json();
    setSettling(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setPendingResult({
      winnerLabel: winner.name,
      message: `🏆 ${winner.name} 승리! ${data.rewarded}명에게 EXP +0.2, 젤리 +2 지급했어요.`,
    });
  }

  function reveal() {
    setRevealed(true);
    settleWinners();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          실시간 여행게임 대전
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">OX퀴즈</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          AI루다가 여행 상식 OX퀴즈를 내고, 팀별로 정답을 맞혀요.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
        {question ? (
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">❓ {question}</p>
        ) : (
          <p className="text-zinc-500">아직 문제가 없어요.</p>
        )}
        {revealed && answer && (
          <p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-400">
            정답: {answer}
          </p>
        )}
        <button
          type="button"
          onClick={getQuestion}
          disabled={loadingQuestion}
          className="mt-4 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {loadingQuestion ? "AI루다가 출제 중..." : "🎲 새 문제 받기"}
        </button>
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
          <div className="flex justify-center gap-2">
            {(["O", "X"] as const).map((v) => (
              <button
                key={v}
                type="button"
                disabled={revealed}
                onClick={() => setPickA(v)}
                className={`h-14 w-14 rounded-full text-xl font-extrabold ${
                  pickA === v ? "bg-amber-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <TeamPicker
            teamName={teamNameB}
            onTeamNameChange={setTeamNameB}
            members={teamB}
            onAdd={(u) => addTo("B", u)}
            onRemove={(id) => removeFrom("B", id)}
          />
          <div className="flex justify-center gap-2">
            {(["O", "X"] as const).map((v) => (
              <button
                key={v}
                type="button"
                disabled={revealed}
                onClick={() => setPickB(v)}
                className={`h-14 w-14 rounded-full text-xl font-extrabold ${
                  pickB === v ? "bg-amber-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={reveal}
        disabled={!question || revealed || !pickA || !pickB || settling}
        className="self-center rounded-full bg-amber-600 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
      >
        {settling ? "정산 중..." : "🔓 정답 공개"}
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
