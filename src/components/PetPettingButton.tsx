"use client";

import { useState } from "react";

type Praise = {
  name: string;
  image: string;
  rating: number;
  review: string;
  reviewer: string;
};

const PRAISES: Praise[] = [
  {
    name: "도쿄 파크 하얏트 (5성급 호텔)",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    review: "체크인부터 필요한 말만 조용히 안내해줘서 부담이 전혀 없었어요. 야경 뷰 방에서 혼자 멍때리기 최고였어요.",
    reviewer: "김소심",
  },
  {
    name: "보르도 와인 맛집 · 르 쁘띠 꺄보",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    review: "직원분이 말 걸지 않고 메뉴판에 설명이 잘 되어 있어서 혼자 가도 눈치 안 보였어요. 와인이 정말 훌륭했어요.",
    reviewer: "이조용",
  },
  {
    name: "스위스 융프라우 전망대",
    image:
      "https://images.unsplash.com/photo-1531210483974-4f8c1f96fa42?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    review: "사람 많은 시간대만 피하면 정상에서 혼자 설산 바라보며 시간 보내기 정말 좋아요. 말 안 해도 되는 여행이었어요.",
    reviewer: "정이동",
  },
  {
    name: "교토 전통 료칸",
    image:
      "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    review: "개인 온천이 있는 방이라 대화 없이도 충분히 힐링됐어요. 조식도 방으로 조용히 가져다주셔서 좋았어요.",
    reviewer: "박안부",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(rating)}
      <span className="text-zinc-300 dark:text-zinc-700">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function PetPettingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1.5 rounded-full border border-pink-300 bg-pink-50 px-2.5 py-1.5 text-xs font-medium text-pink-800 shadow-sm transition-transform hover:scale-105 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-200"
      >
        <span className="relative text-sm">
          🐶
          <span className="absolute -left-2 -top-1 text-[10px]">✋</span>
        </span>
        쓰담쓰담
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  🐶 쓰담쓰담 · 칭찬합니다
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  소심한 여행자들이 다녀온 숙소·맛집·명소를 사진과 함께 칭찬해요.
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

            <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
              {PRAISES.map((p) => (
                <div
                  key={p.name}
                  className="flex gap-3 rounded-2xl border border-sky-100 bg-sky-50/40 p-3 dark:border-sky-900/40 dark:bg-sky-950/10"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {p.name}
                      </p>
                      <Stars rating={p.rating} />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      {p.review}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">{p.reviewer} 님의 후기</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
