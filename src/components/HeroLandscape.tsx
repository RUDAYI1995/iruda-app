import type { SimpleCondition } from "@/lib/weather/openMeteo";

export function HeroLandscape({ condition: _condition = "clear" }: { condition?: SimpleCondition }) {
  return (
    <div className="w-full" style={{ aspectRatio: "1672 / 941" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-world-panorama.png"
        alt="루다월드 세계여행 파노라마"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
