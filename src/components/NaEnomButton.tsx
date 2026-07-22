"use client";

import { useState } from "react";

type Report = {
  name: string;
  image: string;
  rating: number;
  review: string;
  reviewer: string;
};

const DRAINING: Report[] = [
  {
    name: "인싸 전용 시끌벅적 펍",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80",
    rating: 1,
    review: "직원분이 계속 말 걸고 하이파이브 유도해서 너무 힘들었어요. 조용히 있고 싶었는데 기 빨렸어요.",
    reviewer: "김소심",
  },
  {
    name: "단체 참여 강요 액티비티 투어",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80",
    rating: 2,
    review: "혼자 온 사람도 억지로 게임에 껴야 하는 분위기였어요. 낯가리는 사람한테는 완전 비추예요.",
    reviewer: "이조용",
  },
];

const UNKIND: Report[] = [
  {
    name: "불친절 응대 게스트하우스",
    image:
      "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?auto=format&fit=crop&w=600&q=80",
    rating: 1,
    review: "체크인할 때부터 한숨 쉬면서 대답하셔서 너무 위축됐어요. 질문하기가 무서웠어요.",
    reviewer: "정이동",
  },
  {
    name: "무뚝뚝 응대 식당",
    image:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=80",
    rating: 2,
    review: "메뉴 물어봤더니 짜증 섞인 말투로 대답하셔서 그 뒤로 아무 말도 못 하고 먹기만 했어요.",
    reviewer: "박안부",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-red-400">
      {"★".repeat(rating)}
      <span className="text-zinc-300 dark:text-zinc-700">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ReportList({ items }: { items: Report[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((p) => (
        <div
          key={p.name}
          className="flex gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-3 dark:border-red-900/40 dark:bg-red-950/10"
        >
          <img src={p.image} alt={p.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {p.name}
              </p>
              <Stars rating={p.rating} />
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{p.review}</p>
            <p className="mt-1 text-[11px] text-zinc-400">{p.reviewer} 님의 제보</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NaEnomButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-800 shadow-sm transition-transform hover:scale-105 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
      >
        <span className="relative text-sm">
          🫵
          <span className="absolute -right-2 -top-2 text-[9px]">😠</span>
        </span>
        네이놈
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  🫵 네이놈 · 고발합니다
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  소심한 여행자가 가면 기 빨리거나 불친절했던 곳을 제보해요.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="grid max-h-[60vh] gap-5 overflow-y-auto sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
                  기 빨리는 곳
                </h3>
                <ReportList items={DRAINING} />
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
                  불친절한 곳
                </h3>
                <ReportList items={UNKIND} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
