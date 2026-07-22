export function HeroLandscape() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* 청량한 낮 하늘 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #38bdf8 0%, #7dd3fc 35%, #bae6fd 60%, #e0f2fe 100%)",
        }}
      />

      {/* 뭉게구름 */}
      <div className="absolute left-[8%] top-[8%] h-10 w-24 rounded-full bg-white/90 blur-[0.5px]" />
      <div className="absolute left-[6%] top-[6%] h-8 w-16 rounded-full bg-white/90" />
      <div className="absolute right-[15%] top-[14%] h-8 w-20 rounded-full bg-white/85" />
      <div className="absolute right-[13%] top-[12%] h-6 w-14 rounded-full bg-white/85" />

      {/* 해 */}
      <span className="absolute left-[18%] top-[16%] text-3xl">☀️</span>

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
