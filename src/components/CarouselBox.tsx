"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CarouselSlide } from "@/lib/homeCarouselImages";

// 홈 화면 히어로 캐러셀 한 칸(작은 썸네일 + 확대 라이트박스)을 담당하는 공용 컴포넌트.
// 왼쪽 7장 캐러셀과 오른쪽 새 3장 캐러셀이 각자 독립된 타이머/인덱스를 갖도록 재사용함.
export function CarouselBox({
  slides,
  width,
  onOpenPanel,
}: {
  slides: CarouselSlide[];
  width: number;
  onOpenPanel: (key: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const count = slides.length;
  const current = slides[index];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 10000);
    return () => clearInterval(t);
  }, [count]);

  function goPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i - 1 + count) % count);
  }
  function goNext(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i + 1) % count);
  }

  function onHotspotClick(e: React.MouseEvent) {
    if (current.openPanel) {
      e.preventDefault();
      onOpenPanel(current.openPanel);
      setZoomed(false);
    }
  }

  return (
    <>
      <div
        className="group relative h-full overflow-hidden rounded-xl bg-zinc-900 shadow-sm"
        style={{ width }}
      >
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute inset-0 h-full w-full"
          aria-label="이미지 확대해서 보기"
        >
          {slides.map((slide, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={slide.src}
              alt={`캐러셀 이미지 ${i + 1}`}
              className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0 }}
            />
          ))}
        </button>

        <button
          type="button"
          onClick={goPrev}
          aria-label="이전 이미지"
          className="absolute left-0.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="다음 이미지"
          className="absolute right-0.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
        >
          ›
        </button>

        <div className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
          {slides.map((_, i) => (
            <span key={i} className={`h-1 w-1 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-800 shadow-md hover:bg-white"
            aria-label="닫기"
          >
            ✕
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev(e);
            }}
            aria-label="이전 이미지"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-zinc-800 shadow-md hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext(e);
            }}
            aria-label="다음 이미지"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-zinc-800 shadow-md hover:bg-white"
          >
            ›
          </button>

          <div
            className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={`캐러셀 이미지 ${index + 1} 확대`}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />
            {current.hotspot && current.openPanel && (
              <button
                type="button"
                onClick={onHotspotClick}
                aria-label="이 버튼 열기"
                className="absolute"
                style={{
                  top: `${current.hotspot.top}%`,
                  left: `${current.hotspot.left}%`,
                  width: `${current.hotspot.width}%`,
                  height: `${current.hotspot.height}%`,
                }}
              />
            )}
            {current.hotspot && current.href && (
              <Link
                href={current.href}
                aria-label="이 버튼으로 이동"
                className="absolute"
                style={{
                  top: `${current.hotspot.top}%`,
                  left: `${current.hotspot.left}%`,
                  width: `${current.hotspot.width}%`,
                  height: `${current.hotspot.height}%`,
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
