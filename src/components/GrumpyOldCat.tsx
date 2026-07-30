// "포켓몬 냐옹이" 대신 만든 오리지널 캐릭터 — 험악하게 생긴 할배 고양이 선물
export function GrumpyOldCat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="100" rx="34" ry="10" fill="#000" opacity="0.15" />
      {/* 몸 */}
      <path
        d="M30 100 C24 70 28 45 60 45 C92 45 96 70 90 100 Z"
        fill="#c9a876"
        stroke="#6b5638"
        strokeWidth="2"
      />
      {/* 귀 */}
      <path d="M28 46 L18 20 L42 38 Z" fill="#c9a876" stroke="#6b5638" strokeWidth="2" />
      <path d="M92 46 L102 20 L78 38 Z" fill="#c9a876" stroke="#6b5638" strokeWidth="2" />
      <path d="M28 42 L23 26 L38 37 Z" fill="#8a7256" />
      <path d="M92 42 L97 26 L82 37 Z" fill="#8a7256" />
      {/* 얼굴 */}
      <ellipse cx="60" cy="60" rx="30" ry="26" fill="#d8b98a" stroke="#6b5638" strokeWidth="2" />
      {/* 눈썹(험악함) */}
      <path d="M32 47 L46 53" stroke="#3a2e1c" strokeWidth="4" strokeLinecap="round" />
      <path d="M88 47 L74 53" stroke="#3a2e1c" strokeWidth="4" strokeLinecap="round" />
      {/* 눈 (째림) */}
      <path d="M38 57 Q44 53 50 57" stroke="#1a1208" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M82 57 Q76 53 70 57" stroke="#1a1208" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 흉터 */}
      <path d="M70 42 L78 56" stroke="#a15c4a" strokeWidth="2" strokeLinecap="round" />
      {/* 코 */}
      <path d="M56 64 L64 64 L60 70 Z" fill="#7a4a3a" />
      {/* 입 (앙다뭄 + 송곳니) */}
      <path d="M46 76 Q60 82 74 76" stroke="#3a2e1c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M50 77 L48 84" stroke="#f5f0e6" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 77 L72 84" stroke="#f5f0e6" strokeWidth="3" strokeLinecap="round" />
      {/* 수염 */}
      <path d="M20 66 L42 68 M20 74 L42 72 M98 66 L78 68 M98 74 L78 72" stroke="#4a3c28" strokeWidth="1.5" />
      {/* 흰 눈썹/수염 (할배 느낌) */}
      <path d="M35 44 Q40 40 46 44" stroke="#f2ede2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M85 44 Q80 40 74 44" stroke="#f2ede2" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
