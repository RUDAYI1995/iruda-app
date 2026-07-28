"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function useRefreshTick(intervalMs: number) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return tick;
}

const GRID = 6; // 6x6 outer square, perimeter = 4*(GRID-1) = 20 tiles
const TOTAL_TILES = 4 * (GRID - 1);
const LAPS_TO_WIN = 2;
const MONEY_PER_STEP = 10;

type TileType = "corner" | "property";

interface Tile {
  row: number;
  col: number;
  type: TileType;
  label: string;
  price?: number;
}

const CORNER_LABELS = ["출발", "마음 충전", "심표 공간", "응원 공간"];

const PROPERTY_NAMES = [
  "꿈의 도서관",
  "고양이 카페",
  "작은 공방",
  "고요한 산책길",
  "나눔 마켓",
  "별빛 캠핑장",
  "숲속 오두막",
  "아기자기 공방",
  "음악이 흐르는 길",
  "행복 나눔 장터",
  "꽃길 마을",
  "동네 빵집",
  "조용한 미술관",
  "따뜻한 책방",
  "바닷가 산책",
  "기차 여행",
];

const PROPERTY_PRICES = [
  200, 220, 240, 260, 280, 300, 300, 280, 260, 240, 320, 340, 360, 380, 100, 120,
];

function buildTiles(): Tile[] {
  const tiles: Tile[] = [];
  const last = GRID - 1;
  let propIndex = 0;

  // idx0: bottom-right corner (출발)
  tiles.push({ row: last, col: last, type: "corner", label: CORNER_LABELS[0] });
  // bottom row, right to left (excluding both corners)
  for (let col = last - 1; col >= 1; col--) {
    tiles.push({
      row: last,
      col,
      type: "property",
      label: PROPERTY_NAMES[propIndex],
      price: PROPERTY_PRICES[propIndex],
    });
    propIndex++;
  }
  // bottom-left corner (마음 충전)
  tiles.push({ row: last, col: 0, type: "corner", label: CORNER_LABELS[1] });
  // left column, bottom to top (excluding both corners)
  for (let row = last - 1; row >= 1; row--) {
    tiles.push({
      row,
      col: 0,
      type: "property",
      label: PROPERTY_NAMES[propIndex],
      price: PROPERTY_PRICES[propIndex],
    });
    propIndex++;
  }
  // top-left corner (심표 공간)
  tiles.push({ row: 0, col: 0, type: "corner", label: CORNER_LABELS[2] });
  // top row, left to right (excluding both corners)
  for (let col = 1; col <= last - 1; col++) {
    tiles.push({
      row: 0,
      col,
      type: "property",
      label: PROPERTY_NAMES[propIndex],
      price: PROPERTY_PRICES[propIndex],
    });
    propIndex++;
  }
  // top-right corner (응원 공간)
  tiles.push({ row: 0, col: last, type: "corner", label: CORNER_LABELS[3] });
  // right column, top to bottom (excluding both corners)
  for (let row = 1; row <= last - 1; row++) {
    tiles.push({
      row,
      col: last,
      type: "property",
      label: PROPERTY_NAMES[propIndex],
      price: PROPERTY_PRICES[propIndex],
    });
    propIndex++;
  }

  return tiles;
}

interface PlayerDef {
  id: number;
  name: string;
  emoji: string;
  ring: string;
  badge: string;
}

const PLAYER_DEFS: PlayerDef[] = [
  { id: 0, name: "먼치(회색이)", emoji: "🐈‍⬛", ring: "border-zinc-500 bg-zinc-200", badge: "bg-zinc-600" },
  { id: 1, name: "치즈(치즈태비)", emoji: "🐱", ring: "border-orange-400 bg-orange-100", badge: "bg-orange-500" },
  { id: 2, name: "헤디(헤드폰냥)", emoji: "🎧", ring: "border-slate-400 bg-slate-100", badge: "bg-slate-500" },
  { id: 3, name: "삼색이", emoji: "😻", ring: "border-pink-400 bg-pink-100", badge: "bg-pink-500" },
];

interface PlayerState {
  totalSteps: number;
  money: number;
  owned: number[];
}

function initialPlayers(): PlayerState[] {
  return PLAYER_DEFS.map(() => ({ totalSteps: 0, money: 0, owned: [] }));
}

const TOKEN_OFFSETS = [
  { top: "10%", left: "10%" },
  { top: "10%", left: "55%" },
  { top: "55%", left: "10%" },
  { top: "55%", left: "55%" },
];

interface GameState {
  players: PlayerState[];
  ownerOf: Record<number, number>;
  currentPlayer: number;
  lastDice: number | null;
  winner: number | null;
  log: string[];
}

function initialGameState(): GameState {
  return {
    players: initialPlayers(),
    ownerOf: {},
    currentPlayer: 0,
    lastDice: null,
    winner: null,
    log: [],
  };
}

export function AssaGameIntro() {
  const tiles = useMemo(() => buildTiles(), []);
  const [gameStarted, setGameStarted] = useState(false);
  const [state, setState] = useState<GameState>(initialGameState);
  const refreshTick = useRefreshTick(5000);

  const { players, ownerOf, currentPlayer, lastDice, winner, log } = state;

  function resetGame() {
    setState(initialGameState());
  }

  function rollDice() {
    const dice = 1 + Math.floor(Math.random() * 6);

    setState((prev) => {
      if (prev.winner !== null) return prev;

      const players = prev.players.map((p) => ({ ...p, owned: [...p.owned] }));
      const player = players[prev.currentPlayer];
      player.totalSteps += dice;
      player.money += dice * MONEY_PER_STEP;

      const landedIndex = player.totalSteps % TOTAL_TILES;
      const tile = tiles[landedIndex];

      let ownerOf = prev.ownerOf;
      if (tile.type === "property" && ownerOf[landedIndex] === undefined) {
        player.owned.push(landedIndex);
        ownerOf = { ...ownerOf, [landedIndex]: prev.currentPlayer };
      }

      const laps = Math.floor(player.totalSteps / TOTAL_TILES);
      const playerName = PLAYER_DEFS[prev.currentPlayer].name;
      const log = [
        `${playerName}: 주사위 ${dice} → ${tile.label}${tile.type === "property" ? ` (₩${tile.price})` : ""}`,
        ...prev.log,
      ].slice(0, 8);

      const winner = laps >= LAPS_TO_WIN ? prev.currentPlayer : null;
      const currentPlayer =
        winner === null ? (prev.currentPlayer + 1) % PLAYER_DEFS.length : prev.currentPlayer;

      return { players, ownerOf, currentPlayer, lastDice: dice, winner, log };
    });
  }

  const winnerMileage =
    winner !== null
      ? players[winner].owned.reduce((sum, idx) => sum + (tiles[idx].price ?? 0), 0)
      : 0;

  return (
    <div className="flex flex-1 flex-col">
      {!gameStarted && (
        <section className="relative w-full" style={{ aspectRatio: "1023 / 1537" }}>
          <img
            src={`/api/stats/board-image?t=${refreshTick}`}
            alt="루다월드 - 소심한 사람들을 위한 아싸게임"
            className="h-full w-full object-contain"
          />

          <button
            type="button"
            onClick={() => setGameStarted(true)}
            className="assa-start-btn absolute rounded-full bg-gradient-to-b from-pink-400 to-pink-500 px-7 py-3 text-xl font-extrabold text-white shadow-[0_6px_0_#db2777] active:translate-y-1 active:shadow-none"
            style={{ top: "33%", left: "49%", transform: "translate(-50%, -50%)" }}
          >
            START 🐾
          </button>

          <Link
            href="/home"
            className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs text-zinc-600 underline hover:bg-white"
          >
            건너뛰기 →
          </Link>

          {/* 원본 이미지 위 헤더 메뉴 자리에 보이지 않는 클릭 영역만 얹어서 각자 페이지로 이동 */}
          {[
            { href: "/game-guide", left: 39.3, top: 1.69, width: 7.9, height: 1.82 },
            { href: "/how-to-play", left: 47.4, top: 1.69, width: 10.75, height: 1.82 },
            { href: "/community", left: 59.4, top: 1.69, width: 6.75, height: 1.82 },
            { href: "/my-page", left: 66.5, top: 1.69, width: 8.6, height: 1.82 },
            { href: "/login", left: 82.1, top: 1.04, width: 8.8, height: 2.73 },
            { href: "/signup", left: 90.6, top: 0.91, width: 8.9, height: 2.86 },
          ].map((nav) => (
            <Link
              key={nav.href}
              href={nav.href}
              className="absolute"
              style={{
                left: `${nav.left}%`,
                top: `${nav.top}%`,
                width: `${nav.width}%`,
                height: `${nav.height}%`,
              }}
            />
          ))}
        </section>
      )}

      {gameStarted && (
        <section className="flex flex-1 flex-col items-center gap-6 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 px-4 pb-12 pt-6 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
          <button
            type="button"
            onClick={() => setGameStarted(false)}
            className="self-start rounded-full border border-zinc-400 bg-white/80 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white"
          >
            ← 이전 화면으로
          </button>
          <div
            className="relative aspect-square w-full max-w-[640px] rounded-2xl border-4 border-amber-800/60 bg-amber-50 shadow-xl"
          >
            {tiles.map((tile, idx) => {
              const ownerId = ownerOf[idx];
              return (
                <div
                  key={idx}
                  className={`absolute flex flex-col items-center justify-center border border-amber-300/70 p-0.5 text-center ${
                    tile.type === "corner" ? "bg-amber-200 font-bold" : "bg-white"
                  }`}
                  style={{
                    top: `${(tile.row / GRID) * 100}%`,
                    left: `${(tile.col / GRID) * 100}%`,
                    width: `${100 / GRID}%`,
                    height: `${100 / GRID}%`,
                  }}
                >
                  <span className="text-[9px] leading-tight text-zinc-700 sm:text-[10px]">
                    {tile.label}
                  </span>
                  {tile.price && (
                    <span className="text-[8px] text-zinc-500 sm:text-[9px]">
                      ₩{tile.price}
                    </span>
                  )}
                  {ownerId !== undefined && (
                    <span className="text-[9px]">{PLAYER_DEFS[ownerId].emoji}</span>
                  )}

                  {PLAYER_DEFS.map((p, pi) => {
                    const pos = players[pi].totalSteps % TOTAL_TILES;
                    if (pos !== idx) return null;
                    return (
                      <div
                        key={pi}
                        className="absolute flex flex-col items-center"
                        style={{ top: TOKEN_OFFSETS[pi].top, left: TOKEN_OFFSETS[pi].left }}
                      >
                        <span className="text-base drop-shadow">{p.emoji}</span>
                        <span
                          className={`mt-0.5 rounded-full px-1 text-[7px] font-bold text-white ${p.badge}`}
                        >
                          💰{players[pi].money}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl bg-white/70 px-6 py-4 text-center shadow-inner">
                <p className="text-2xl font-extrabold text-amber-900">아싸게임</p>
                <p className="text-xs text-amber-700">2바퀴 먼저 돌면 승리!</p>
              </div>
            </div>
          </div>

          {winner === null ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                현재 턴: {PLAYER_DEFS[currentPlayer].emoji} {PLAYER_DEFS[currentPlayer].name}
                {lastDice !== null && <span className="ml-2 text-zinc-400">(직전 주사위: {lastDice})</span>}
              </p>
              <button
                type="button"
                onClick={rollDice}
                className="rounded-full bg-zinc-900 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 dark:bg-zinc-50 dark:text-zinc-900"
              >
                🎲 주사위 굴리기
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-amber-100 px-8 py-6 text-center shadow-lg">
              <p className="text-xl font-extrabold text-amber-900">
                🏆 {PLAYER_DEFS[winner].emoji} {PLAYER_DEFS[winner].name} 승리!
              </p>
              <p className="text-sm text-amber-800">
                보유한 땅 {players[winner].owned.length}곳 · 최종 마일리지 {winnerMileage}점
              </p>
              <button
                type="button"
                onClick={resetGame}
                className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
              >
                다시 하기
              </button>
            </div>
          )}

          <div className="grid w-full max-w-[640px] grid-cols-2 gap-2 sm:grid-cols-4">
            {PLAYER_DEFS.map((p, pi) => (
              <div
                key={p.id}
                className={`rounded-xl border-2 p-2 text-center text-xs ${p.ring}`}
              >
                <div className="text-lg">{p.emoji}</div>
                <div className="font-bold">{p.name}</div>
                <div>바퀴 {Math.min(Math.floor(players[pi].totalSteps / TOTAL_TILES), LAPS_TO_WIN)}/{LAPS_TO_WIN}</div>
                <div>💰{players[pi].money}</div>
                <div>땅 {players[pi].owned.length}곳</div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-[640px] rounded-xl bg-white/70 p-3 text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p className="mb-1 font-bold">📜 진행 기록</p>
            {log.length === 0 ? (
              <p>주사위를 굴려 게임을 시작해보세요.</p>
            ) : (
              log.map((line, i) => <p key={i}>{line}</p>)
            )}
          </div>

          <Link
            href="/home"
            className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400"
          >
            건너뛰기 → 루다월드 홈으로
          </Link>
        </section>
      )}
    </div>
  );
}
