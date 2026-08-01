"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { AdventureZone, Direction, PathNode } from "@/lib/adventureZones";
import { LocationMissions } from "./location-missions";

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const STEPS_PER_EDGE = 4;

function num(pct: string) {
  return parseFloat(pct);
}

// 두 지점 사이를 STEPS_PER_EDGE개의 걸음으로 나눠서, 화살표를 누를 때마다
// 한 걸음씩 그 사이를 걸어가도록 함(끝점 포함, 시작점은 제외).
function walkSteps(from: PathNode, to: PathNode): PathNode[] {
  const fromTop = num(from.top);
  const fromLeft = num(from.left);
  const toTop = num(to.top);
  const toLeft = num(to.left);
  return Array.from({ length: STEPS_PER_EDGE }, (_, i) => {
    const t = (i + 1) / STEPS_PER_EDGE;
    return {
      top: `${fromTop + (toTop - fromTop) * t}%`,
      left: `${fromLeft + (toLeft - fromLeft) * t}%`,
    };
  });
}

type Traveling = { fromNode: string; toNode: string; dir: Direction; steps: PathNode[]; idx: number };

export function ZoneMapClient({ zone }: { zone: AdventureZone }) {
  const { data: session } = useSession();
  const [started, setStarted] = useState(false);
  const [atNode, setAtNode] = useState<string | null>(null);
  const [position, setPosition] = useState<PathNode | null>(null);
  const [traveling, setTraveling] = useState<Traveling | null>(null);
  const [facing, setFacing] = useState<Direction>("down");
  const [walking, setWalking] = useState(false);
  const walkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const name = session?.user?.name ?? "닝겐";

  function explore() {
    if (started || !zone.pathGraph) return;
    const startNode = zone.pathGraph.startNode;
    setStarted(true);
    setAtNode(startNode);
    setPosition(zone.pathGraph.nodes[startNode]);
  }

  useEffect(() => {
    if (!started || !zone.pathGraph) return;
    const graph = zone.pathGraph;

    function bumpWalkAnim() {
      setWalking(true);
      if (walkTimer.current) clearTimeout(walkTimer.current);
      walkTimer.current = setTimeout(() => setWalking(false), 380);
    }

    function onKeyDown(e: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[e.key];
      if (!direction) return;
      e.preventDefault();
      setFacing(direction);

      setTraveling((prevTravel) => {
        // 이미 두 지점 사이를 걷고 있는 중
        if (prevTravel) {
          if (direction === prevTravel.dir) {
            const nextIdx = prevTravel.idx + 1;
            if (nextIdx >= prevTravel.steps.length - 1) {
              // 이번 걸음으로 마지막 지점(목적지)에 도착
              setAtNode(prevTravel.toNode);
              setPosition(graph.nodes[prevTravel.toNode]);
              bumpWalkAnim();
              return null;
            }
            setPosition(prevTravel.steps[nextIdx]);
            bumpWalkAnim();
            return { ...prevTravel, idx: nextIdx };
          }
          if (direction === OPPOSITE[prevTravel.dir]) {
            const prevIdx = prevTravel.idx - 1;
            if (prevIdx < 0) {
              // 출발지로 되돌아감
              setAtNode(prevTravel.fromNode);
              setPosition(graph.nodes[prevTravel.fromNode]);
              bumpWalkAnim();
              return null;
            }
            setPosition(prevTravel.steps[prevIdx]);
            bumpWalkAnim();
            return { ...prevTravel, idx: prevIdx };
          }
          return prevTravel; // 갈림길 중간에서 다른 방향키는 무시(교차로에서만 방향 전환)
        }

        // 한 지점에 멈춰 서 있는 중 — 그 방향에 길이 있으면 걷기 시작
        setAtNode((currentAt) => {
          if (!currentAt) return currentAt;
          const nextNode = graph.edges[currentAt]?.[direction];
          if (!nextNode) return currentAt; // 길이 없으면 제자리
          const steps = walkSteps(graph.nodes[currentAt], graph.nodes[nextNode]);
          setPosition(steps[0]);
          bumpWalkAnim();
          setTraveling({ fromNode: currentAt, toNode: nextNode, dir: direction, steps, idx: 0 });
          return currentAt;
        });
        return prevTravel;
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [started, zone.pathGraph]);

  const locationLabel = traveling
    ? "이동 중..."
    : atNode && zone.pathGraph
      ? zone.pathGraph.nodes[atNode].label
      : "";

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        className="relative w-full max-w-[95vw] overflow-hidden rounded-2xl shadow-lg"
        style={{ aspectRatio: `${zone.mapWidth} / ${zone.mapHeight}`, maxHeight: "85vh" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={zone.mapImage} alt={`${zone.name} 지역 지도`} className="absolute inset-0 h-full w-full object-cover" />

        <LocationMissions zone={zone} />

        {position && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-200 ease-linear"
            style={{ top: position.top, left: position.left }}
          >
            <div style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ai-ruda.png"
                alt={name}
                className={`h-12 w-12 rounded-full border-2 border-white object-cover shadow-lg ${
                  walking ? "animate-walk-bob" : ""
                }`}
              />
            </div>
            <span className="mt-0.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
              {name}
            </span>
          </div>
        )}

        <button
          onClick={explore}
          disabled={started}
          className="absolute bottom-3 right-3 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
        >
          🧭 모험하기
        </button>
      </div>

      {zone.pathGraph && started && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          ↑↓←→ 방향키로 길을 따라 한 걸음씩 이동해보세요 · 현재 위치: {locationLabel}
        </p>
      )}
    </div>
  );
}
