"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "iruda-bgm-on";
const TRACK_URL = "https://cdn1.suno.ai/58e0d065-dfa1-42b6-ac04-e9083ede4ee2.mp3";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOn, setIsOn] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const shouldPlay = stored !== "0";
    setIsOn(shouldPlay);

    const audio = audioRef.current;
    if (!audio || !shouldPlay) return;

    audio.volume = 0.35;

    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();

    function onFirstInteraction() {
      tryPlay();
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    }
    window.addEventListener("click", onFirstInteraction);
    window.addEventListener("keydown", onFirstInteraction);
    window.addEventListener("touchstart", onFirstInteraction);

    return () => {
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    const next = !isOn;
    setIsOn(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");

    if (!audio) return;
    if (next) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  return (
    <>
      <audio ref={audioRef} src={TRACK_URL} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-indigo-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-indigo-600 shadow-md backdrop-blur transition-transform hover:scale-105 dark:border-indigo-700 dark:bg-zinc-800/90 dark:text-indigo-300"
        title="루다월드 배경음악"
      >
        {isOn ? "🔊 음악 끄기" : "🔇 음악 켜기"}
      </button>
    </>
  );
}
