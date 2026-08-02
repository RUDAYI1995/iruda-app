"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VoteCard = {
  id: string;
  kind: string;
  label: string;
  photoAUrl: string;
  photoBUrl: string | null;
  status: string;
  resolutionNote: string | null;
  myBallot: string | null;
  tally: Record<string, number>;
  totalVotes: number;
};

export default function RudaVotePage() {
  const [votes, setVotes] = useState<VoteCard[] | null>(null);
  const [castingId, setCastingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/ruda-vote");
    const data = await res.json();
    setVotes(data.votes ?? []);
  }

  useEffect(() => {
    const init = async () => {
      await load();
    };
    init();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  async function castBallot(voteId: string, choice: string) {
    setCastingId(voteId);
    await fetch(`/api/ruda-vote/${voteId}/ballot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });
    setCastingId(null);
    load();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold text-black dark:bg-red-950/40 dark:text-white">
          🗳️ 루다투표제
        </p>
        <h1 className="text-3xl font-extrabold text-black dark:text-white">
          AI가 판단하기 애매한 건, 다 같이 투표로 정해요
        </h1>
        <p className="mt-3 text-sm font-medium text-black dark:text-white">
          위대한 모험(🎉 파티전용 퀘스트) 사진 미션, 아싸던전(🧍 솔플 퀘스트) 현실 미션 인증, 표정짓기 대결 판정,
          루다연합 캠페인이 100명을 넘기면 자동 상정되는 국민투표제까지 여기서 처리돼요. 3표가 모이면 다수결로
          즉시 확정돼요.
        </p>
      </div>

      {votes === null && <p className="text-center text-black dark:text-white">불러오는 중...</p>}
      {votes?.length === 0 && (
        <p className="text-center text-black dark:text-white">지금은 진행 중인 투표가 없어요.</p>
      )}

      {votes?.map((v) => (
        <div
          key={v.id}
          className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-700 dark:bg-red-950/20"
        >
          <p className="mb-3 text-center text-base font-bold text-black dark:text-white">{v.label}</p>

          {v.kind === "FACE_OFF" && v.photoBUrl ? (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <img src={v.photoAUrl} alt="A팀" className="aspect-square w-full rounded-xl object-cover" />
              <img src={v.photoBUrl} alt="B팀" className="aspect-square w-full rounded-xl object-cover" />
            </div>
          ) : (
            <img
              src={v.photoAUrl}
              alt={v.label}
              className="mb-4 max-h-80 w-full rounded-xl object-contain"
            />
          )}

          {v.kind === "REFERENDUM" && v.status === "APPROVED" ? (
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-200">
              📢 국민투표 통과! {v.resolutionNote}
            </div>
          ) : (
          <div className="flex items-center justify-center gap-3">
            {v.kind === "FACE_OFF" ? (
              <>
                <button
                  disabled={castingId === v.id}
                  onClick={() => castBallot(v.id, "A")}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold text-black shadow disabled:opacity-40 dark:text-white ${
                    v.myBallot === "A" ? "bg-red-400" : "bg-white hover:bg-red-100 dark:bg-zinc-900"
                  }`}
                >
                  A팀에 투표 ({v.tally.A ?? 0})
                </button>
                <button
                  disabled={castingId === v.id}
                  onClick={() => castBallot(v.id, "B")}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold text-black shadow disabled:opacity-40 dark:text-white ${
                    v.myBallot === "B" ? "bg-red-400" : "bg-white hover:bg-red-100 dark:bg-zinc-900"
                  }`}
                >
                  B팀에 투표 ({v.tally.B ?? 0})
                </button>
              </>
            ) : (
              <>
                <button
                  disabled={castingId === v.id}
                  onClick={() => castBallot(v.id, "APPROVE")}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold text-black shadow disabled:opacity-40 dark:text-white ${
                    v.myBallot === "APPROVE" ? "bg-red-400" : "bg-white hover:bg-red-100 dark:bg-zinc-900"
                  }`}
                >
                  {v.kind === "REFERENDUM" ? "🙆 찬성" : "✅ 인정"} ({v.tally.APPROVE ?? 0})
                </button>
                <button
                  disabled={castingId === v.id}
                  onClick={() => castBallot(v.id, "REJECT")}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold text-black shadow disabled:opacity-40 dark:text-white ${
                    v.myBallot === "REJECT" ? "bg-red-400" : "bg-white hover:bg-red-100 dark:bg-zinc-900"
                  }`}
                >
                  {v.kind === "REFERENDUM" ? "🙅 반대" : "❌ 반려"} ({v.tally.REJECT ?? 0})
                </button>
              </>
            )}
          </div>
          )}
          {!(v.kind === "REFERENDUM" && v.status === "APPROVED") && (
            <p className="mt-2 text-center text-xs font-semibold text-black dark:text-white">
              {v.totalVotes}/3표 모임 · 3표가 되면 자동 확정
            </p>
          )}
        </div>
      ))}

      <div className="flex justify-center">
        <Link href="/home" className="text-sm font-semibold text-black underline dark:text-white">
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
