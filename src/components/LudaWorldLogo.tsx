export function LudaWorldLogo() {
  return (
    <div className="relative shrink-0" style={{ width: 100, height: 28 }}>
      <div
        className="pointer-events-none absolute top-0 select-none whitespace-nowrap"
        style={{ left: -48 }}
      >
        <span className="absolute left-0 top-[20px] text-4xl font-extrabold tracking-tight text-sky-100 dark:text-sky-950">
          루다월드
        </span>
        <span className="absolute left-0 top-[14px] text-4xl font-extrabold tracking-tight text-sky-200/80 dark:text-sky-900/80">
          루다월드
        </span>
        <span className="absolute left-0 top-[8px] text-4xl font-extrabold tracking-tight text-sky-300/80 dark:text-sky-800/80">
          루다월드
        </span>
        <span className="absolute left-0 top-[3px] text-4xl font-extrabold tracking-tight text-sky-400/90 dark:text-sky-700/90">
          루다월드
        </span>
        <span className="relative text-4xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400">
          루다월드
        </span>

        {/* 빨강 체크 표시 */}
        <span
          className="absolute -left-3 top-0 text-xl text-red-500"
          style={{ transform: "rotate(-15deg)" }}
        >
          ✓
        </span>

        {/* 분홍 물결 밑줄 */}
        <svg
          className="absolute left-0 top-[46px]"
          width="150"
          height="12"
          viewBox="0 0 150 12"
        >
          <path
            d="M2,6 Q10,0 18,6 T34,6 T50,6 T66,6 T82,6 T98,6 T114,6 T130,6 T146,6"
            fill="none"
            stroke="#f472b6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
