"use client";

import { useEffect, useState } from "react";

const TRENDING = [
  "오사카 정모",
  "소심한 여행 후기",
  "데이가이드 추천",
  "레디룸 매칭",
  "혼자 가는 여행 동행 구함",
  "여행코스짜기",
];

export function PopularSearchTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TRENDING.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
      <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 font-semibold text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
        인기검색어
      </span>
      <span className="shrink-0 font-medium text-zinc-700 dark:text-zinc-300">
        {index + 1}.
      </span>
      <span
        key={index}
        className="inline-block w-[132px] truncate align-bottom"
        style={{ animation: "ticker-fade 2.8s ease-in-out" }}
      >
        {TRENDING[index]}
      </span>
    </div>
  );
}
