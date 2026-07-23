import type { SimpleCondition } from "@/lib/weather/openMeteo";

const RAIN_DROPS = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 4.2) % 100}%`,
  delay: `${(i % 8) * 0.15}s`,
  duration: `${0.6 + (i % 5) * 0.08}s`,
}));

export function HeroLandscape({ condition = "clear" }: { condition?: SimpleCondition }) {
  const isGloomy = condition !== "clear";
  const isRaining = condition === "rain" || condition === "thunder";
  const isThunder = condition === "thunder";

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* 하늘 - 날씨에 따라 맑음/우중충 전환 */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: isGloomy
            ? "linear-gradient(180deg, #4b5563 0%, #6b7280 35%, #9ca3af 60%, #d1d5db 100%)"
            : "linear-gradient(180deg, #38bdf8 0%, #7dd3fc 35%, #bae6fd 60%, #e0f2fe 100%)",
        }}
      />

      {/* 번개 플래시 */}
      {isThunder && (
        <div
          className="absolute inset-0 bg-white"
          style={{ animation: "lightning-flash 5s ease-in-out infinite" }}
        />
      )}
      {isThunder && (
        <span
          className="absolute left-[62%] top-[6%] text-4xl"
          style={{ animation: "lightning-flash 5s ease-in-out infinite" }}
        >
          ⚡
        </span>
      )}

      {/* 뭉게구름 (맑을 때 기본) */}
      <div className="absolute left-[8%] top-[8%] h-10 w-24 rounded-full bg-white/90 blur-[0.5px]" />
      <div className="absolute left-[6%] top-[6%] h-8 w-16 rounded-full bg-white/90" />
      <div className="absolute right-[15%] top-[14%] h-8 w-20 rounded-full bg-white/85" />
      <div className="absolute right-[13%] top-[12%] h-6 w-14 rounded-full bg-white/85" />

      {/* 흐리거나 비 올 때 구름 추가 */}
      {isGloomy && (
        <>
          <div className="absolute left-[30%] top-[5%] h-9 w-28 rounded-full bg-slate-300/90" />
          <div className="absolute left-[42%] top-[10%] h-7 w-20 rounded-full bg-slate-400/80" />
          <div className="absolute right-[32%] top-[6%] h-10 w-24 rounded-full bg-slate-300/90" />
          <div className="absolute right-[42%] top-[16%] h-6 w-16 rounded-full bg-slate-400/70" />
          <div className="absolute left-[60%] top-[4%] h-8 w-32 rounded-full bg-slate-300/80" />
        </>
      )}

      {/* 해 - 맑을 때만 */}
      {!isGloomy && <span className="absolute left-[18%] top-[16%] text-3xl">☀️</span>}

      {/* 비 애니메이션 */}
      {isRaining && (
        <div className="pointer-events-none absolute inset-0">
          {RAIN_DROPS.map((d, i) => (
            <span
              key={i}
              className="absolute top-[-5%] h-8 w-[2px] rounded-full bg-sky-100/70"
              style={{
                left: d.left,
                animation: `rain-fall ${d.duration} linear infinite`,
                animationDelay: d.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* 비행기 */}
      <span
        className="absolute left-[55%] top-[10%] text-2xl"
        style={{ transform: "rotate(-8deg)" }}
      >
        ✈️
      </span>

      {/* 지형 SVG: 융프라우 설산 + 능선 언덕 + 오솔길 */}
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* 융프라우 설산 (뒤쪽, 여러 봉우리) */}
        <polygon
          points="205,55 225,95 245,68 268,110 292,80 318,120 345,90 372,140 400,150 400,220 195,220"
          fill="#64748b"
        />
        <polygon
          points="205,55 218,82 233,68 245,90 259,78 268,95 292,80 300,95 318,120 330,105 345,90 358,112 372,140 380,150 205,150"
          fill="#94a3b8"
          opacity="0.6"
        />
        {/* 만년설 */}
        <polygon
          points="205,55 216,78 225,95 236,74 245,68 255,86 268,110 280,92 292,80 305,98 318,120 332,100 345,90 360,115 372,140 358,150 205,150"
          fill="#f8fafc"
        />

        {/* 뒷 언덕 (연한 초록) */}
        <path
          d="M0,190 C60,165 120,175 180,168 C240,161 300,178 400,160 L400,230 L0,230 Z"
          fill="#bbf7d0"
        />
        {/* 중간 언덕 */}
        <path
          d="M0,215 C70,195 140,210 200,200 C270,190 330,205 400,195 L400,260 L0,260 Z"
          fill="#86efac"
        />
        {/* 앞 언덕 (진한 초록, 지면 역할) */}
        <path
          d="M0,245 C80,225 160,245 220,235 C290,225 340,240 400,230 L400,300 L0,300 Z"
          fill="#4ade80"
        />

        {/* 산으로 이어지는 오솔길 */}
        <path
          d="M40,290 C90,270 120,255 150,245 C185,233 210,215 235,175"
          fill="none"
          stroke="#d6a86a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="14 8"
        />
      </svg>

      {/* 들판 곳곳의 세계 유적지 미니어처 */}
      <div className="absolute bottom-[34%] left-[6%] flex flex-col items-center">
        <span className="text-xl drop-shadow">🏯</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">경복궁</span>
      </div>
      <div className="absolute bottom-[38%] left-[48%] flex flex-col items-center">
        <span className="text-xl drop-shadow">🗼</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">프랑스</span>
      </div>
      <div className="absolute bottom-[10%] left-[82%] flex flex-col items-center">
        <span className="text-xl drop-shadow">🏛️</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">이탈리아</span>
      </div>
      <div className="absolute bottom-[36%] left-[88%] flex flex-col items-center">
        <span className="text-lg drop-shadow">🗽</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">미국</span>
      </div>
      <div className="absolute bottom-[46%] left-[16%] flex flex-col items-center">
        <span className="text-lg drop-shadow">🎡</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">영국</span>
      </div>
      <div className="absolute bottom-[44%] left-[62%] flex flex-col items-center">
        <span className="text-lg drop-shadow">🏮</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">중국</span>
      </div>
      <div className="absolute bottom-[20%] left-[28%] flex flex-col items-center">
        <span className="text-lg drop-shadow">🛕</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">인도</span>
      </div>
      <div className="absolute bottom-[42%] left-[74%] flex flex-col items-center">
        <span className="text-lg drop-shadow">🕌</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">이집트</span>
      </div>
      <div className="absolute bottom-[16%] left-[94%] flex flex-col items-center">
        <span className="text-lg drop-shadow">🗿</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-zinc-700">칠레</span>
      </div>

      {/* 나무 & 꽃 장식 */}
      <span className="absolute bottom-[24%] left-[20%] text-xl">🌲</span>
      <span className="absolute bottom-[16%] left-[30%] text-2xl">🌳</span>
      <span className="absolute bottom-[30%] left-[42%] text-lg">🌲</span>
      <span className="absolute bottom-[12%] left-[60%] text-xl">🌳</span>
      <span className="absolute bottom-[20%] left-[72%] text-lg">🌲</span>
      <span className="absolute bottom-[10%] left-[15%] text-base">🌼</span>
      <span className="absolute bottom-[9%] left-[38%] text-base">🌸</span>
      <span className="absolute bottom-[14%] left-[52%] text-base">🌼</span>
      <span className="absolute bottom-[8%] left-[68%] text-base">🌷</span>

      {/* 배낭 멘 고양이들 - 오솔길 위, 산을 향해 "가즈아" */}
      <div className="absolute bottom-[26%] left-[24%] flex flex-col items-center">
        <div className="relative mb-1 whitespace-nowrap rounded-full bg-yellow-300 px-3 py-1 text-xs font-extrabold text-zinc-900 shadow-md">
          가즈아!! 🔥
        </div>
        <div className="flex items-end -space-x-2">
          <div className="relative">
            <span className="absolute -right-1 bottom-0 text-base">🎒</span>
            <span className="relative text-2xl">🐈</span>
            <div className="mx-auto mt-0.5 h-1.5 w-5 rounded-full bg-black/20 blur-[1px]" />
          </div>
          <div className="relative">
            <span className="absolute -right-1 bottom-0 text-lg">🎒</span>
            <span className="relative text-3xl">🐱</span>
            <div className="mx-auto mt-0.5 h-2 w-6 rounded-full bg-black/20 blur-[1px]" />
          </div>
          <div className="relative">
            <span className="absolute -right-1 bottom-0 text-base">🎒</span>
            <span className="relative text-2xl">🐈‍⬛</span>
            <div className="mx-auto mt-0.5 h-1.5 w-5 rounded-full bg-black/20 blur-[1px]" />
          </div>
        </div>
      </div>

      {/* 아이돌 리놀렉스 대구 방문 콘서트 */}
      <div className="absolute bottom-[6%] left-[44%] flex flex-col items-center">
        <div className="relative mb-1 whitespace-nowrap rounded-2xl bg-fuchsia-100 px-3 py-1.5 text-center text-[10px] font-extrabold leading-tight text-fuchsia-900 shadow-md">
          🎤 리놀렉스(가칭) 대구 방문
          <br />
          2026년 8월 10일에 만나요!
          <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-fuchsia-100" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl">💃</span>
          <span className="text-2xl">🕺</span>
          <div className="relative">
            <span className="text-2xl">🙋‍♀️</span>
            <div className="absolute -right-1 -top-6 whitespace-nowrap rounded-full bg-rose-500 px-2 py-0.5 text-[8px] font-bold text-white shadow">
              오빠 사랑해요!
            </div>
          </div>
          <span className="text-2xl">🙌</span>
          <span className="text-2xl">🙋</span>
        </div>
      </div>

      {/* 하늘 위 귀여운 애드벌룬 */}
      <div className="absolute left-[26%] top-[3%] flex flex-col items-center">
        <span className="text-3xl">🎈</span>
        <div className="mt-0.5 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-900 shadow-md">
          강원도에서 부산까지 절찬 여행코스
        </div>
      </div>
      <div className="absolute left-[68%] top-[2%] flex flex-col items-center">
        <span className="text-3xl">🎈</span>
        <div className="mt-0.5 whitespace-nowrap rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-900 shadow-md">
          루다월드만의 단톡혜택 지금즉시 확인해보세요
        </div>
      </div>

      {/* 여행버스 - 언덕길 갓길에 정차, 기사님 말풍선 */}
      <div className="absolute bottom-[14%] left-[8%] flex flex-col items-center">
        <div className="relative mb-1 whitespace-nowrap rounded-2xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900 shadow-md">
          좋은 말 할 때 타라잉
          <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-sky-100" />
        </div>
        <span className="text-4xl">🚌</span>
        <div className="mx-auto -mt-1 h-2 w-10 rounded-full bg-black/25 blur-[1px]" />
      </div>
    </div>
  );
}
