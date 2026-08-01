"use client";

import { useEffect, useRef, useState } from "react";
import type { DetectedItem } from "@/lib/notificationItems";

export function PackingBagReveal({ items }: { items: DetectedItem[] }) {
  const [open, setOpen] = useState(false);
  const [wiggling, setWiggling] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (items.length === 0) return null;

  function toggle() {
    if (open) {
      if (timerRef.current) clearInterval(timerRef.current);
      setOpen(false);
      setRevealedCount(0);
      return;
    }

    setWiggling(true);
    setTimeout(() => setWiggling(false), 500);
    setOpen(true);
    setRevealedCount(1); // 열자마자 첫 번째 물건부터 나오기 시작

    let count = 1;
    timerRef.current = setInterval(() => {
      count += 1;
      setRevealedCount(count);
      if (count >= items.length && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 550);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        className={`text-2xl ${wiggling ? "animate-bag-wiggle" : ""}`}
        title={open ? "가방 닫기" : "가방 열어보기"}
      >
        🎒
      </button>
      {open && (
        <div className="flex min-h-[2.5rem] flex-wrap items-end justify-center gap-2 rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
          {items.slice(0, revealedCount).map((item) => (
            <span key={item.emoji} className="animate-item-pop-out text-xl" title={item.keyword}>
              {item.emoji}
            </span>
          ))}
        </div>
      )}
      {!open && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          가방을 눌러 챙길 물건 {items.length}개 하나씩 확인하기
        </p>
      )}
    </div>
  );
}
