const PETALS = [
  { left: "42%", delay: "0s", dur: "5s", x: "20px" },
  { left: "50%", delay: "1.2s", dur: "6s", x: "-16px" },
  { left: "58%", delay: "0.6s", dur: "4.6s", x: "24px" },
  { left: "66%", delay: "2s", dur: "5.4s", x: "-20px" },
  { left: "74%", delay: "0.3s", dur: "5.8s", x: "18px" },
  { left: "82%", delay: "1.6s", dur: "5s", x: "-14px" },
  { left: "90%", delay: "0.9s", dur: "6.2s", x: "22px" },
];

export function CherryBlossomBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="animate-petal-fall absolute top-0 text-xl"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, "--petal-x": p.x } as React.CSSProperties}
        >
          🌸
        </span>
      ))}
    </div>
  );
}

export function CallCenterBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-[12%] top-1/2 -translate-y-1/2">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-3xl shadow-md dark:bg-sky-900/40">
          🧑‍💼
          <span className="absolute -right-1 -top-1 text-lg">🎧</span>
        </div>
        <span className="animate-signal-ping absolute inset-0 rounded-full border-2 border-sky-400" />
        <span
          className="animate-signal-ping absolute inset-0 rounded-full border-2 border-sky-400"
          style={{ animationDelay: "0.7s" }}
        />
      </div>
      <span className="absolute right-[26%] top-[30%] text-lg opacity-80">💬</span>
    </div>
  );
}

const LANDMARK_BURST = [
  { emoji: "🗼", x: "-70px", y: "-40px", rot: "-15deg", delay: "0s" },
  { emoji: "🏯", x: "60px", y: "-50px", rot: "20deg", delay: "0.3s" },
  { emoji: "🗽", x: "-50px", y: "40px", rot: "-10deg", delay: "0.6s" },
  { emoji: "🏛️", x: "70px", y: "35px", rot: "15deg", delay: "0.9s" },
  { emoji: "⛩️", x: "0px", y: "-65px", rot: "5deg", delay: "1.2s" },
  { emoji: "🗻", x: "0px", y: "60px", rot: "-5deg", delay: "1.5s" },
];

export function TravelBurstBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[46%] top-1/2 -translate-y-1/2 text-2xl">
        <span className="animate-backpacker-walk inline-block">🚶</span>
        <span className="ml-[-6px] text-lg">🎒</span>
      </div>
      <div className="absolute right-[16%] top-1/2 -translate-y-1/2 text-3xl">✈️</div>
      <div className="absolute right-[16%] top-1/2 -translate-y-1/2">
        {LANDMARK_BURST.map((lm, i) => (
          <span
            key={i}
            className="animate-landmark-burst absolute text-lg"
            style={
              {
                "--lm-x": lm.x,
                "--lm-y": lm.y,
                "--lm-rot": lm.rot,
                animationDelay: lm.delay,
              } as React.CSSProperties
            }
          >
            {lm.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SafetyBridgeBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[46%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
        <span className="animate-rope-sway inline-block origin-top text-3xl">🪢</span>
        <span className="animate-danger-shake flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow">
          ✕
        </span>
        <span className="text-[10px] font-semibold text-red-500">위태로운 길</span>
      </div>
      <div className="absolute right-[10%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
        <span className="text-3xl">🌉</span>
        <span className="animate-safe-glow flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow">
          ✓
        </span>
        <span className="text-[10px] font-semibold text-emerald-600">안전한 길</span>
      </div>
    </div>
  );
}

export function LevelUpBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="animate-console-wiggle absolute left-[46%] top-1/2 -translate-y-1/2 text-3xl">
        🧒🎮
      </span>
      <span className="absolute left-[58%] top-[35%] text-lg opacity-70">👾</span>
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2">
        <span className="animate-levelup-grow absolute whitespace-nowrap rounded-full bg-violet-500 px-3 py-1 text-xs font-extrabold text-white shadow-lg">
          LEVEL UP!
        </span>
      </div>
    </div>
  );
}
