"use client";

const BURST_HEARTS = [
  { x: -34, y: -18, delay: "0s" },
  { x: 30, y: -22, delay: "0.05s" },
  { x: -22, y: 22, delay: "0.1s" },
  { x: 26, y: 20, delay: "0.08s" },
  { x: 0, y: -34, delay: "0.12s" },
  { x: 0, y: 30, delay: "0.14s" },
];

export function PinkHeartBurst() {
  return (
    <div className="relative flex h-20 w-full items-center justify-center overflow-visible">
      {/* 사람들이 모이는 아이콘 */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-0.5 opacity-70">
        <span className="text-sm">🧍</span>
        <span className="text-sm">🧍</span>
        <span className="text-sm">🧍</span>
      </div>

      {/* 커지는 하트 */}
      <span className="animate-heart-grow absolute text-3xl">💗</span>

      {/* 터지며 흩어지는 하트들 */}
      {BURST_HEARTS.map((h, i) => (
        <span
          key={i}
          className="animate-heart-pop absolute text-lg"
          style={
            {
              animationDelay: h.delay,
              "--heart-x": `${h.x}px`,
              "--heart-y": `${h.y}px`,
            } as React.CSSProperties
          }
        >
          💕
        </span>
      ))}
    </div>
  );
}
