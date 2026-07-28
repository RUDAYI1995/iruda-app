import Link from "next/link";

const STEPS = [
  { emoji: "🐈", title: "말을 선택해요", desc: "먼치·치즈·헤디·삼색이 네 마리 고양이 중에서 나를 대표할 말을 골라요." },
  { emoji: "🎲", title: "주사위를 던져요", desc: "내 차례가 되면 주사위를 굴려서 나온 숫자만큼 이동해요." },
  { emoji: "🧭", title: "한 칸씩 이동하며 여행해요", desc: "출발지에서 왼쪽으로 이동하며 2바퀴를 먼저 도는 사람이 1등이에요." },
  { emoji: "🎁", title: "땅을 모으고 보상도 받아요", desc: "처음 도착한 땅은 내 소유가 되고, 이동할 때마다 마일리지가 쌓여요." },
  { emoji: "🏆", title: "1등하면 마일리지 지급", desc: "2바퀴를 가장 먼저 돌면 내가 모은 땅의 가치만큼 최종 마일리지를 받아요." },
];

export default function HowToPlayPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-amber-900">플레이 방법</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          이런 순서로 아싸게임을 즐기시면 돼요.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl">
              {step.emoji}
            </div>
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-50">
                {i + 1}. {step.title}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl bg-pink-50 p-5 text-center text-sm text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
        🐾 이 게임은 승패보다, 함께한 시간이 더 소중해요.
      </div>

      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 dark:bg-zinc-50 dark:text-zinc-900"
        >
          지금 바로 시작하기 →
        </Link>
      </div>
    </div>
  );
}
