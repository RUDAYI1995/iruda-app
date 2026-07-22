export const CLOUD_LAYERS = [
  { top: "4%", size: 120, opacity: 0.85, duration: "30s" },
  { top: "14%", size: 150, opacity: 0.9, duration: "38s" },
  { top: "26%", size: 90, opacity: 0.7, duration: "20s" },
  { top: "38%", size: 130, opacity: 0.8, duration: "34s" },
  { top: "50%", size: 100, opacity: 0.65, duration: "24s" },
  { top: "62%", size: 160, opacity: 0.85, duration: "42s" },
  { top: "74%", size: 110, opacity: 0.7, duration: "27s" },
  { top: "86%", size: 140, opacity: 0.75, duration: "36s" },
];

function Cloud({ size }: { size: number }) {
  return (
    <div
      className="relative shrink-0 rounded-full bg-white/90 blur-[1px]"
      style={{ width: size, height: size * 0.5 }}
    >
      <div
        className="absolute rounded-full bg-white/90"
        style={{ width: size * 0.55, height: size * 0.55, top: -size * 0.2, left: size * 0.15 }}
      />
      <div
        className="absolute rounded-full bg-white/90"
        style={{ width: size * 0.4, height: size * 0.4, top: -size * 0.12, left: size * 0.55 }}
      />
    </div>
  );
}

export function AuroraSky() {
  return (
    <div
      className="absolute inset-x-0 top-0 h-1/3"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(134,239,172,0.55), transparent 60%)," +
          "radial-gradient(ellipse 60% 50% at 30% 5%, rgba(167,139,250,0.5), transparent 65%)," +
          "radial-gradient(ellipse 60% 50% at 70% 5%, rgba(96,165,250,0.45), transparent 65%)",
        mixBlendMode: "screen",
      }}
    />
  );
}

export function CloudBackground() {
  return (
    <>
      <AuroraSky />
      {CLOUD_LAYERS.map((layer, i) => (
        <div
          key={i}
          className="animate-cloud-drift absolute flex w-[200%] gap-16"
          style={{ top: layer.top, opacity: layer.opacity, animationDuration: layer.duration }}
        >
          <Cloud size={layer.size} />
          <Cloud size={layer.size * 0.8} />
          <Cloud size={layer.size * 1.1} />
          <Cloud size={layer.size * 0.7} />
          <Cloud size={layer.size} />
          <Cloud size={layer.size * 0.8} />
        </div>
      ))}
    </>
  );
}
