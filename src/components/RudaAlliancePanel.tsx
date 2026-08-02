"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALLIANCE_CAUSES } from "@/lib/allianceCauses";

type JoinStatus = { count: number; joined: boolean; threshold: number };

export function RudaAlliancePanel({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, JoinStatus>>({});
  const [joining, setJoining] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadStatus(slug: string) {
    const res = await fetch(`/api/alliance/join?causeId=${slug}`);
    const data = await res.json();
    setStatus((prev) => ({ ...prev, [slug]: data }));
  }

  useEffect(() => {
    const init = async () => {
      await Promise.all(ALLIANCE_CAUSES.map((c) => loadStatus(c.slug)));
    };
    init();
  }, []);

  async function join(slug: string) {
    setJoining(slug);
    setMessage(null);
    try {
      const res = await fetch("/api/alliance/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ causeId: slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "동참에 실패했어요");
        return;
      }
      await loadStatus(slug);
      setMessage(
        data.submittedVoteId
          ? "🎉 100명 동참 달성! 루다투표제에 국민투표로 정식 상정됐어요."
          : "함께해주셔서 감사해요! 동참이 반영됐어요."
      );
    } finally {
      setJoining(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">🛡️ 루다연합</p>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              정의에 반하는 악당들을 반대합니다
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-100 dark:hover:bg-blue-950/40"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          권위주의 체제 아래 인권 문제로 고통받는 사람들의 이야기예요. 한 캠페인당 100명이 동참하면
          루다투표제(국민투표제)에 자동으로 정식 상정돼요.
        </p>

        <div className="flex flex-col gap-4">
          {ALLIANCE_CAUSES.map((cause) => {
            const s = status[cause.slug];
            const isOpen = expanded === cause.slug;
            const pct = s ? Math.min(100, Math.round((s.count / s.threshold) * 100)) : 0;
            return (
              <div
                key={cause.slug}
                className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : cause.slug)}
                  className="block w-full text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cause.image} alt={cause.country} className="h-36 w-full object-cover" />
                  <div className="p-4">
                    <p className="mb-1 text-xs font-bold text-blue-600 dark:text-blue-400">{cause.country}</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-50">{cause.title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {isOpen ? cause.detail : cause.summary}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-100 p-4 dark:border-zinc-900">
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mb-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {s ? `${s.count} / ${s.threshold}명 동참` : "불러오는 중..."}
                    </p>
                    <button
                      type="button"
                      disabled={joining === cause.slug || s?.joined}
                      onClick={() => join(cause.slug)}
                      className="w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {s?.joined ? "✅ 동참했어요" : joining === cause.slug ? "동참하는 중..." : "🤝 동참하기"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {message && (
          <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-center text-xs font-semibold text-blue-800 dark:bg-blue-950/20 dark:text-blue-200">
            {message}
          </p>
        )}

        <div className="mt-4 flex justify-center">
          <Link href="/ruda-vote" className="text-xs font-semibold text-zinc-500 underline dark:text-zinc-400">
            루다투표제 바로가기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
