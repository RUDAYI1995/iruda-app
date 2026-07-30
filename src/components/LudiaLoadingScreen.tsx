"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PAW_COUNT = 10;

// 바탕화면 로딩화면 이미지(1672x941) 안에 그려진 발바닥 진행바 위치를 %로 잡은 값
const BAR_STYLE = { left: "31.5%", top: "83.2%", width: "33%", height: "4.5%" };

export function LudiaLoadingScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const doneRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstRouteRef = useRef(true);
  const currentKeyRef = useRef(pathname + "?" + searchParams.toString());

  function startLoading() {
    if (!doneRef.current) return; // 이미 로딩 중이면 중복 시작 안 함
    doneRef.current = false;
    setFadingOut(false);
    setProgress(0);
    setVisible(true);
    tickRef.current = setInterval(() => {
      setProgress((p) => Math.min(90, p + 7));
    }, 120);
  }

  function finishLoading() {
    if (doneRef.current) return;
    doneRef.current = true;
    if (tickRef.current) clearInterval(tickRef.current);
    setProgress(100);
    setFadingOut(true);
    setTimeout(() => setVisible(false), 350);
  }

  // 최초 페이지 로딩: window load 이벤트를 기다림
  useEffect(() => {
    tickRef.current = setInterval(() => {
      if (doneRef.current) return;
      setProgress((p) => Math.min(90, p + 7));
    }, 120);

    if (document.readyState === "complete") {
      setTimeout(finishLoading, 200);
    } else {
      window.addEventListener("load", finishLoading);
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      window.removeEventListener("load", finishLoading);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새 버튼/링크를 눌러 다른 페이지로 이동을 "시작"하는 순간을 history API 후킹으로 감지
  useEffect(() => {
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      const result = originalPush.apply(this, args as Parameters<typeof originalPush>);
      setTimeout(startLoading, 0);
      return result;
    };
    window.history.replaceState = function (...args) {
      const result = originalReplace.apply(this, args as Parameters<typeof originalReplace>);
      setTimeout(startLoading, 0);
      return result;
    };
    const onPopState = () => setTimeout(startLoading, 0);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // 새 페이지로 실제로 이동이 "완료"되면(pathname 변경 감지) 로딩 종료
  useEffect(() => {
    const key = pathname + "?" + searchParams.toString();
    if (isFirstRouteRef.current) {
      isFirstRouteRef.current = false;
      currentKeyRef.current = key;
      return;
    }
    if (key !== currentKeyRef.current) {
      currentKeyRef.current = key;
      // 새 페이지가 이미 마운트된 상태이므로 살짝의 여유만 주고 종료
      setTimeout(finishLoading, 150);
    }
  }, [pathname, searchParams]);

  if (!visible) return null;

  const litCount = Math.round((progress / 100) * PAW_COUNT);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 transition-opacity duration-300"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl" style={{ aspectRatio: "1672 / 941" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loading-screen.png"
          alt="LUDIA WORLD 로딩 중"
          className="h-full w-full object-cover"
        />
        <div className="absolute flex items-center" style={BAR_STYLE}>
          {Array.from({ length: PAW_COUNT }).map((_, i) => (
            <span key={i} className="flex flex-1 items-center justify-center">
              <span
                className="text-[1.1vw] transition-opacity duration-200"
                style={{
                  opacity: i < litCount ? 1 : 0,
                  filter: "drop-shadow(0 0 6px #ffd66b) drop-shadow(0 0 2px #fff7d6)",
                }}
              >
                🐾
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
