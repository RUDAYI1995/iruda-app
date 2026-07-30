// 두 손 모으고 간절한 눈빛을 보내는 오리지널 AI루다 고양이 캐릭터
export function PleadingCat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="70" cy="122" rx="38" ry="9" fill="#000" opacity="0.12" />
      {/* 몸 */}
      <path
        d="M38 122 C32 90 36 64 70 64 C104 64 108 90 102 122 Z"
        fill="#f4c9d9"
        stroke="#c98aa6"
        strokeWidth="2"
      />
      {/* 모아 쥔 두 손 (간절함) */}
      <ellipse cx="70" cy="98" rx="16" ry="13" fill="#fbe0ea" stroke="#c98aa6" strokeWidth="2" />
      <path d="M62 92 Q70 84 78 92" stroke="#c98aa6" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 귀 */}
      <path d="M40 66 L32 40 L54 58 Z" fill="#f4c9d9" stroke="#c98aa6" strokeWidth="2" />
      <path d="M100 66 L108 40 L86 58 Z" fill="#f4c9d9" stroke="#c98aa6" strokeWidth="2" />
      <path d="M40 62 L35 46 L48 57 Z" fill="#e9a7c2" />
      <path d="M100 62 L105 46 L92 57 Z" fill="#e9a7c2" />
      {/* 얼굴 */}
      <ellipse cx="70" cy="80" rx="32" ry="27" fill="#fce4ee" stroke="#c98aa6" strokeWidth="2" />
      {/* 큰 간절한 눈 */}
      <ellipse cx="58" cy="80" rx="9" ry="11" fill="#3a2a2a" />
      <ellipse cx="82" cy="80" rx="9" ry="11" fill="#3a2a2a" />
      <circle cx="61" cy="76" r="3" fill="#fff" />
      <circle cx="85" cy="76" r="3" fill="#fff" />
      <circle cx="56" cy="84" r="1.6" fill="#fff" opacity="0.8" />
      <circle cx="80" cy="84" r="1.6" fill="#fff" opacity="0.8" />
      {/* 애교 눈썹 */}
      <path d="M48 66 Q58 61 66 66" stroke="#c98aa6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M74 66 Q82 61 92 66" stroke="#c98aa6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 코/입 */}
      <path d="M66 92 L74 92 L70 97 Z" fill="#e07a9a" />
      <path d="M70 97 Q65 102 60 99 M70 97 Q75 102 80 99" stroke="#8a4a63" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 볼터치 */}
      <ellipse cx="46" cy="90" rx="5" ry="3.5" fill="#f5a8c0" opacity="0.7" />
      <ellipse cx="94" cy="90" rx="5" ry="3.5" fill="#f5a8c0" opacity="0.7" />
      {/* 수염 */}
      <path d="M18 82 L42 84 M18 90 L42 88 M122 82 L98 84 M122 90 L98 88" stroke="#c98aa6" strokeWidth="1.5" />
    </svg>
  );
}
