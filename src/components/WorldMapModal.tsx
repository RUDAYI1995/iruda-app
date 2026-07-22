"use client";

interface WorldMapModalProps {
  categoryLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WorldMapModal({ categoryLabel, onConfirm, onCancel }: WorldMapModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-b from-sky-950 via-indigo-950 to-black p-8 text-center shadow-2xl"
      >
        {/* 지구본 그리드 배경 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(125,211,252,0.25) 0px, transparent 1px, transparent 28px, rgba(125,211,252,0.25) 29px)," +
              "repeating-linear-gradient(90deg, rgba(125,211,252,0.2) 0px, transparent 1px, transparent 40px, rgba(125,211,252,0.2) 41px)",
            maskImage: "radial-gradient(circle at 50% 40%, black 55%, transparent 75%)",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/30"
          style={{ boxShadow: "0 0 60px 10px rgba(56,189,248,0.25) inset" }}
        />

        <div className="relative flex flex-col items-center gap-4">
          <div className="text-6xl">🌍</div>
          <p className="text-lg font-bold text-white">
            {categoryLabel}(으)로
            <br />
            떠나시겠습니까?
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onConfirm}
              className="rounded-full bg-sky-400 px-6 py-2.5 text-sm font-bold text-sky-950 transition-colors hover:bg-sky-300"
            >
              YES
            </button>
            <button
              onClick={onCancel}
              className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              NO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
