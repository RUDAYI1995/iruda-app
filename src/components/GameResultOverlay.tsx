"use client";

import { useEffect, useState } from "react";
import { GrumpyOldCat } from "@/components/GrumpyOldCat";

const PURPLE_DROPS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.25}s`,
  duration: `${1.6 + (i % 4) * 0.3}s`,
}));

const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 17) % 100}%`,
  top: `${(i * 11) % 40}%`,
  x: `${((i % 5) - 2) * 60}px`,
  y: `${240 + (i % 6) * 30}px`,
  delay: `${(i % 8) * 0.08}s`,
  color: ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6"][i % 5],
}));

function LoseScene({ onDone }: { onDone: () => void }) {
  const [hit, setHit] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setHit(1), 900);
    const t2 = setTimeout(() => setHit(2), 1600);
    const t3 = setTimeout(onDone, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black">
      {PURPLE_DROPS.map((d, i) => (
        <span
          key={i}
          className="animate-result-drop-fall absolute top-0 h-4 w-4 rounded-full"
          style={{
            left: d.left,
            animationDelay: d.delay,
            animationDuration: d.duration,
            background: "radial-gradient(circle at 35% 30%, #d8b4fe, #7c3aed)",
            boxShadow: "0 0 10px #7c3aed",
          }}
        />
      ))}

      <div className="animate-result-shadow-emerge relative flex flex-col items-center">
        <div className="relative">
          <span className="animate-result-hammer-swing absolute -right-8 -top-6 origin-bottom-left text-5xl">
            🔨
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ai-ruda.png"
            alt="AI루다"
            className="h-28 w-28 rounded-full border-4 border-purple-500 object-cover object-top shadow-[0_0_30px_rgba(168,85,247,0.7)]"
          />
        </div>
        {hit >= 1 && (
          <span className="animate-result-nyang-pop absolute -right-2 top-4 text-2xl font-extrabold text-purple-200">
            냥!
          </span>
        )}
        {hit >= 2 && (
          <span className="animate-result-nyang-pop absolute -right-10 top-8 text-2xl font-extrabold text-purple-200">
            냥!
          </span>
        )}
      </div>

      <p className="animate-result-text-pop mt-6 text-6xl font-black tracking-widest text-purple-400 drop-shadow-[0_0_18px_rgba(168,85,247,0.8)]">
        LOSE
      </p>
    </div>
  );
}

function WinScene({ label, onDone }: { label: string; onDone: () => void }) {
  const [phase, setPhase] = useState<"gift" | "runaway">("gift");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("runaway"), 2000);
    const t2 = setTimeout(onDone, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-amber-100 via-white to-amber-50 dark:from-amber-950 dark:via-zinc-950 dark:to-zinc-950">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="animate-result-confetti-burst absolute h-3 w-3 rounded-sm"
          style={
            {
              left: c.left,
              top: c.top,
              background: c.color,
              animationDelay: c.delay,
              "--confetti-x": c.x,
              "--confetti-y": c.y,
            } as React.CSSProperties
          }
        />
      ))}

      <p className="animate-result-text-pop text-6xl font-black tracking-widest text-amber-500 drop-shadow-[0_0_18px_rgba(245,158,11,0.6)]">
        WIN
      </p>
      <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300">{label} 승리!</p>

      <div
        className={`relative mt-4 flex flex-col items-center ${
          phase === "runaway" ? "animate-result-mascot-runaway" : "animate-result-mascot-bounce-in"
        }`}
      >
        <div className="relative rounded-2xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-md dark:bg-zinc-900 dark:text-indigo-300">
          보상은 나다옹~
          <span className="absolute -bottom-1.5 left-8 h-3 w-3 rotate-45 bg-white dark:bg-zinc-900" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ai-ruda.png"
            alt="AI루다"
            className="h-24 w-24 rounded-full border-4 border-amber-400 object-cover object-top shadow-lg"
          />
          <GrumpyOldCat className="h-20 w-20 drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
}

export function GameResultOverlay({
  winnerLabel,
  onClose,
}: {
  winnerLabel: string;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"lose" | "win">("lose");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {stage === "lose" ? (
        <LoseScene onDone={() => setStage("win")} />
      ) : (
        <WinScene label={winnerLabel} onDone={onClose} />
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs text-white hover:bg-black/50"
      >
        건너뛰기
      </button>
    </div>
  );
}
