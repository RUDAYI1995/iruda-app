const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};

// dice.png(고정된 3눈 그림)만 쓰면 실제 굴린 값과 상관없이 항상 3처럼 보이는 문제가 있어서,
// 실제 값에 맞는 눈금을 매번 다시 그리는 주사위 얼굴
export function DiceFace({ value, className }: { value: number; className?: string }) {
  const pips = PIP_LAYOUTS[value] ?? PIP_LAYOUTS[1];
  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-sky-300 to-sky-400 shadow-inner ${className ?? ""}`}
    >
      {pips.map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}
