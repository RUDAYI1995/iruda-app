"use client";

import { useEffect, useRef, useState } from "react";

const CABIN_WIDTH = 440;
const CABIN_HEIGHT = 220;
const CHARACTER_SIZE = 56;
const MOVE_STEP = 14;
const ATTENDANT_STEP = 10;
const CATCH_DISTANCE = 30;
const CATCHES_BEFORE_RESPAWN = 2;

const CENTER_POS = { x: CABIN_WIDTH / 2, y: CABIN_HEIGHT / 2 };
const ATTENDANT_START = { x: CABIN_WIDTH / 2 - 24, y: 8 };

const WAITING_SPOTS = [
  { x: 24, y: 90 },
  { x: CABIN_WIDTH - 80, y: 90 },
  { x: CABIN_WIDTH / 2 - 28, y: CABIN_HEIGHT - 60 },
];

type Direction = "idle" | "left" | "right" | "up" | "down";

function Seat() {
  return (
    <div className="relative flex h-14 w-12 flex-col items-center">
      {/* 등받이 */}
      <div className="h-8 w-11 rounded-t-lg rounded-b-sm bg-sky-400/80 shadow-inner" />
      {/* 팔걸이 */}
      <div className="absolute top-3 -left-1 h-6 w-2 rounded bg-sky-500/70" />
      <div className="absolute top-3 -right-1 h-6 w-2 rounded bg-sky-500/70" />
      {/* 좌석 방석 */}
      <div className="-mt-1 h-4 w-12 rounded-md bg-sky-300/80" />
    </div>
  );
}

function characterStyle(direction: Direction) {
  switch (direction) {
    case "left":
      return { transform: "scaleX(1)" };
    case "right":
      return { transform: "scaleX(-1)" };
    case "up":
      return { transform: "rotate(-18deg)" };
    case "down":
      return { transform: "rotate(18deg)" };
    default:
      return { transform: "none" };
  }
}

interface CabinExplorerProps {
  /** 아직 매칭돼서 함께 대기 중인 다른 동료 수 (최대 3명까지 표시) */
  waitingCount?: number;
  /** true면 승무원이 나를 쫓아다니는 술래잡기가 시작돼요 */
  chaseActive?: boolean;
}

export function CabinExplorer({ waitingCount = 0, chaseActive = false }: CabinExplorerProps) {
  const [pos, setPos] = useState(CENTER_POS);
  const [direction, setDirection] = useState<Direction>("idle");
  const [attendantPos, setAttendantPos] = useState(ATTENDANT_START);
  const [catchCount, setCatchCount] = useState(0);
  const [caughtMessage, setCaughtMessage] = useState<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let nextDirection: Direction | null = null;

      setPos((p) => {
        let { x, y } = p;
        if (e.key === "ArrowUp") {
          y -= MOVE_STEP;
          nextDirection = "up";
        }
        if (e.key === "ArrowDown") {
          y += MOVE_STEP;
          nextDirection = "down";
        }
        if (e.key === "ArrowLeft") {
          x -= MOVE_STEP;
          nextDirection = "left";
        }
        if (e.key === "ArrowRight") {
          x += MOVE_STEP;
          nextDirection = "right";
        }
        x = Math.max(0, Math.min(CABIN_WIDTH - CHARACTER_SIZE, x));
        y = Math.max(0, Math.min(CABIN_HEIGHT - CHARACTER_SIZE, y));
        return { x, y };
      });

      if (nextDirection) {
        setDirection(nextDirection);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => setDirection("idle"), 350);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // 승무원 추격 AI: chaseActive일 때만 플레이어 쪽으로 한 걸음씩 다가옴
  useEffect(() => {
    if (!chaseActive) {
      setAttendantPos(ATTENDANT_START);
      setCatchCount(0);
      setCaughtMessage(null);
      return;
    }

    const interval = setInterval(() => {
      setAttendantPos((a) => {
        const target = posRef.current;
        const dx = target.x - a.x;
        const dy = target.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return a;
        const step = Math.min(ATTENDANT_STEP, dist);
        return {
          x: a.x + (dx / dist) * step,
          y: a.y + (dy / dist) * step,
        };
      });
    }, 450);

    return () => clearInterval(interval);
  }, [chaseActive]);

  // 충돌(잡힘) 감지
  useEffect(() => {
    if (!chaseActive) return;
    const dist = Math.hypot(pos.x - attendantPos.x, pos.y - attendantPos.y);
    if (dist < CATCH_DISTANCE) {
      setCatchCount((c) => {
        const next = c + 1;
        if (next >= CATCHES_BEFORE_RESPAWN) {
          setCaughtMessage("승무원한테 두 번 잡혔어요! 다시 태어나요 🌀");
          setPos(CENTER_POS);
          setAttendantPos(ATTENDANT_START);
          setTimeout(() => setCaughtMessage(null), 1500);
          return 0;
        }
        setCaughtMessage(`승무원한테 잡혔어요! (${next}/${CATCHES_BEFORE_RESPAWN})`);
        setAttendantPos(ATTENDANT_START);
        setTimeout(() => setCaughtMessage(null), 1200);
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, attendantPos, chaseActive]);

  const isRunning = direction === "left" || direction === "right";
  const characterEmoji = isRunning ? "🏃" : "🧍";

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-sky-700">
        {chaseActive
          ? "승무원을 피해 도망치세요! 화살표 키로 이동해요"
          : "화살표 키로 기내를 돌아다녀보세요 (테스트)"}
      </p>
      {caughtMessage && (
        <p className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
          {caughtMessage}
        </p>
      )}
      <div
        className="relative overflow-hidden rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white shadow-inner"
        style={{ width: CABIN_WIDTH, height: CABIN_HEIGHT }}
      >
        {/* 좌석 줄 (3열 x 2블록, 가운데 통로) */}
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="absolute left-0 right-0 flex items-start justify-between px-6"
            style={{ top: 16 + row * 62 }}
          >
            <div className="flex gap-2">
              <Seat />
              <Seat />
            </div>
            <div className="flex gap-2">
              <Seat />
              <Seat />
            </div>
          </div>
        ))}

        {/* 대기 중인 동료들 */}
        {WAITING_SPOTS.slice(0, waitingCount).map((spot, i) => (
          <div
            key={i}
            className="absolute text-4xl leading-none opacity-80"
            style={{ left: spot.x, top: spot.y }}
            title={`동료 ${i + 1}`}
          >
            🧍
          </div>
        ))}

        {/* 승무원 NPC */}
        <div
          className="absolute flex flex-col items-center text-4xl leading-none transition-all duration-300 ease-linear"
          style={{ left: attendantPos.x, top: attendantPos.y }}
          title="승무원"
        >
          👩‍✈️
        </div>

        <div
          className="absolute text-5xl leading-none transition-all duration-100"
          style={{
            left: pos.x,
            top: pos.y,
            width: CHARACTER_SIZE,
            height: CHARACTER_SIZE,
            ...characterStyle(direction),
          }}
        >
          {characterEmoji}
        </div>
      </div>
    </div>
  );
}
