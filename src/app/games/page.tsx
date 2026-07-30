import Link from "next/link";

const MODES = [
  { href: "/games/ox-quiz", emoji: "❓", title: "OX퀴즈", desc: "여행 상식 OX퀴즈로 대결해요." },
  {
    href: "/games/visit-race",
    emoji: "📍",
    title: "방문인증",
    desc: "지정된 지점에 먼저 도착하는 팀이 승리해요.",
  },
  {
    href: "/games/run-race",
    emoji: "🏃",
    title: "거리 달리기",
    desc: "20초 동안 GPS로 측정한 이동거리로 승부해요.",
  },
  {
    href: "/games/vote-battle",
    emoji: "🗣️",
    title: "투표",
    desc: "AI루다가 낸 주제로 설전을 벌이고 참가자가 투표해요.",
  },
  {
    href: "/games/face-off",
    emoji: "🎭",
    title: "표정짓기",
    desc: "AI루다 카운트다운에 맞춰 표정을 짓고 투표로 승부해요.",
  },
];

export default function GamesHubPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          소심한 사람들을 위한
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">실시간 여행게임 대전</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          팀끼리 매칭돼 5가지 미션으로 대결해요. 이긴 팀은 EXP와 젤리를 받아요!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-amber-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-amber-950/20"
          >
            <div className="text-3xl">{m.emoji}</div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{m.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/home"
          className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400"
        >
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
