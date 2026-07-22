import Link from "next/link";

const LANDMARKS = [
  { emoji: "🗼", top: "12%", left: "18%", rotate: -8 },
  { emoji: "🗻", top: "22%", left: "62%", rotate: 4 },
  { emoji: "🏰", top: "40%", left: "8%", rotate: 6 },
  { emoji: "⛩️", top: "48%", left: "78%", rotate: -5 },
  { emoji: "🏛️", top: "66%", left: "30%", rotate: 3 },
  { emoji: "🗽", top: "72%", left: "62%", rotate: -4 },
];

export function AdventureBanner() {
  return (
    <div
      className="relative flex-1 overflow-hidden rounded-3xl ring-2 ring-amber-400/50"
      style={{
        background:
          "linear-gradient(180deg, #1e1b4b 0%, #4c1d95 22%, #7c2d92 32%, #0369a1 46%, #0e7490 56%, #166534 68%, #14532d 100%)",
        minHeight: 460,
      }}
    >
      {/* 산맥 실루엣 */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "26%",
          height: "18%",
          background: "#1e1b3a",
          clipPath:
            "polygon(0% 100%, 8% 40%, 18% 80%, 28% 20%, 40% 70%, 52% 10%, 64% 65%, 76% 25%, 88% 75%, 100% 35%, 100% 100%)",
          opacity: 0.85,
        }}
      />

      {/* 세계 유명 여행지 아이콘들 */}
      {LANDMARKS.map((lm, i) => (
        <div
          key={i}
          className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl shadow-lg ring-1 ring-white/30 backdrop-blur-sm"
          style={{ top: lm.top, left: lm.left, transform: `rotate(${lm.rotate}deg)` }}
        >
          {lm.emoji}
        </div>
      ))}

      {/* 별빛 */}
      <div
        className="absolute inset-x-0 top-0 h-1/4 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, white 0.5px, transparent 1px)," +
            "radial-gradient(circle at 60% 15%, white 0.6px, transparent 1px)," +
            "radial-gradient(circle at 80% 40%, white 0.5px, transparent 1px)," +
            "radial-gradient(circle at 35% 60%, white 0.5px, transparent 1px)",
          backgroundSize: "60px 60px, 90px 90px, 70px 70px, 50px 50px",
        }}
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-5 px-8 py-16 text-center">
        <span className="text-5xl drop-shadow-lg">⚔️🛡️</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-amber-100 drop-shadow-md sm:text-4xl">
          용사들이여, 모여라!
        </h2>
        <p className="text-lg font-semibold text-amber-50/90">
          용자들이여 모험을 떠나자!
        </p>
        <p className="max-w-sm text-sm leading-6 text-violet-100/80">
          레디룸에서 동료들을 모으고, 30초 안에 전원이 준비를 마치면
          모험(정모)이 시작돼요.
        </p>
        <Link
          href="/matching-test"
          className="rounded-full bg-amber-400 px-7 py-3 text-sm font-bold text-amber-950 shadow-lg transition-transform hover:scale-105 hover:bg-amber-300"
        >
          레디룸 매칭 체험하기
        </Link>
      </div>
    </div>
  );
}
