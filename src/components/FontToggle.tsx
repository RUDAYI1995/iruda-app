"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "iruda-font-pref";

export function FontToggle() {
  const [isOriginalFont, setIsOriginalFont] = useState(false);

  useEffect(() => {
    setIsOriginalFont(document.documentElement.dataset.font === "original");
  }, []);

  function toggle() {
    const next = isOriginalFont ? "custom" : "original";
    if (next === "original") {
      document.documentElement.dataset.font = "original";
    } else {
      delete document.documentElement.dataset.font;
    }
    localStorage.setItem(STORAGE_KEY, next);
    setIsOriginalFont(next === "original");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50 rounded-full border border-slate-400 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md backdrop-blur transition-transform hover:scale-105 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200"
      title="루다월드 글씨체 변경"
    >
      {isOriginalFont ? "가 시스템 글씨체로" : "가 기본 글씨체로"}
    </button>
  );
}
