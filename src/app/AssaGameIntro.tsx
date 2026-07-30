"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

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

const CORNER_LABELS = ["출발해라냥", "마음 충전", "심표 공간", "응원 공간"];

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

// public/board-scenic.png(1254x1254, 챗GPT가 만들어준 삽화형 보드) 위 20칸의 실제 픽셀
// 중심좌표를 %로 환산한 표. buildTiles()의 idx 순서(우하단 코너부터 시계반대방향)와
// 1:1로 대응하도록 그리드 측정으로 좌표를 잡음.
const TILE_POS: { left: number; top: number }[] = [
  { left: 91.31, top: 91.31 }, // 0 우하단 코너
  { left: 74.72, top: 91.31 }, // 1 꿈의 도서관
  { left: 58.13, top: 91.31 }, // 2 고양이 카페
  { left: 41.55, top: 91.31 }, // 3 작은 공방
  { left: 24.96, top: 91.31 }, // 4 고요한 산책길
  { left: 8.37, top: 91.31 }, // 5 좌하단 코너
  { left: 8.37, top: 74.72 }, // 6 나눔 마켓
  { left: 8.37, top: 58.13 }, // 7 별빛 캠핑장
  { left: 8.37, top: 41.55 }, // 8 숲속 오두막
  { left: 8.37, top: 24.96 }, // 9 아기자기 공방
  { left: 8.37, top: 8.37 }, // 10 좌상단 코너
  { left: 24.96, top: 8.37 }, // 11 음악이 흐르는 길
  { left: 41.55, top: 8.37 }, // 12 행복 나눔 장터
  { left: 58.13, top: 8.37 }, // 13 꽃길 마을
  { left: 74.72, top: 8.37 }, // 14 동네 빵집
  { left: 91.31, top: 8.37 }, // 15 우상단 코너
  { left: 91.31, top: 24.96 }, // 16 조용한 미술관
  { left: 91.31, top: 41.55 }, // 17 따뜻한 책방
  { left: 91.31, top: 58.13 }, // 18 바닷가 산책
  { left: 91.31, top: 74.72 }, // 19 기차 여행
];

// 각 칸을 그대로 오려 둔 확대용 이미지 (public/tiles/tile-{idx}.png) — 도착 팝업에서 크게 보여줄 때 사용
const TILE_IMG = (idx: number) => `/tiles/tile-${idx}.png`;

const BOARD_IMG_W = 1130;

// public/board-scenic.png 위에서 체스말이 각 칸(가로 약 16.7%) 안에서 벗어나지 않도록
// 잡은 표시 폭(%). 기존 board-game-bg.png용 PIECE_BBOX와는 별도로 이 보드 전용으로 둠.
const PIECE_WIDTH_PCT_BOARD2 = [9.8, 10.0, 9.5, 10.8];

// 챗GPT로 원본 체스말 4개를 분리해 받은 조각 이미지(public/tokens/piece-0~3.png, 투명배경)의
// 원본 대비 상대 크기를 잡기 위한 기준 폭. board-game-bg.png 안에서 각 말이 차지하던 실제 너비.
const PIECE_BBOX = [
  { width: 170 }, // 흰 고양이(초록 망토) = 먼치
  { width: 172 }, // 왕 고양이(빨강) = 치즈
  { width: 165 }, // 분홍 고양이 = 하다
  { width: 190 }, // 마법사 고양이(보라) = 삼색이
];

interface PlayerDef {
  id: number;
  name: string;
  img: string;
  ring: string;
  badge: string;
  text: string;
}

// 이름은 원본 보드 이미지의 하단 플레이어 카드에 적힌 이름 그대로 사용.
const PLAYER_DEFS: PlayerDef[] = [
  { id: 0, name: "먼치(흰색이)", img: "/tokens/cat-green.png", ring: "border-green-500 bg-green-50", badge: "bg-green-600", text: "text-green-700" },
  { id: 1, name: "치즈(치즈태비)", img: "/tokens/cat-blue.png", ring: "border-blue-500 bg-blue-50", badge: "bg-blue-600", text: "text-blue-700" },
  { id: 2, name: "하다(헤드폰냥)", img: "/tokens/cat-pink.png", ring: "border-pink-500 bg-pink-50", badge: "bg-pink-600", text: "text-pink-700" },
  { id: 3, name: "삼색이", img: "/tokens/cat-purple.png", ring: "border-purple-500 bg-purple-50", badge: "bg-purple-600", text: "text-purple-700" },
];

interface PlayerState {
  totalSteps: number;
  money: number;
  owned: number[];
}

function initialPlayers(): PlayerState[] {
  return PLAYER_DEFS.map(() => ({ totalSteps: 0, money: 0, owned: [] }));
}

interface GameState {
  players: PlayerState[];
  ownerOf: Record<number, number>;
  turnOrder: number[];
  turnPos: number;
  lastDice: number | null;
  winner: number | null;
  log: string[];
}

function shuffledOrder(): number[] {
  const arr = [0, 1, 2, 3];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initialGameState(order: number[]): GameState {
  return {
    players: initialPlayers(),
    ownerOf: {},
    turnOrder: order,
    turnPos: 0,
    lastDice: null,
    winner: null,
    log: [],
  };
}

export function AssaGameIntro() {
  const tiles = useMemo(() => buildTiles(), []);
  const { data: session, update: updateSession } = useSession();
  const [gameStarted, setGameStarted] = useState(false);
  const [myPlayer, setMyPlayer] = useState<number | null>(null);
  const [state, setState] = useState<GameState>(() => initialGameState(shuffledOrder()));
  const [sceneTile, setSceneTile] = useState<number | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [testLoggingIn, setTestLoggingIn] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [diceEntered, setDiceEntered] = useState(false);
  const [diceSpinning, setDiceSpinning] = useState(false);
  const [diceFace, setDiceFace] = useState<number | null>(null);
  const [animPos, setAnimPos] = useState<Record<number, number>>({});
  const [startFlying, setStartFlying] = useState(false);
  const [startEntered, setStartEntered] = useState(false);
  const [customNickname, setCustomNickname] = useState("");
  const [drawingTurn, setDrawingTurn] = useState(false);
  const refreshTick = useRefreshTick(5000);

  const { players, ownerOf, turnOrder, turnPos, lastDice, winner, log } = state;
  const currentPlayer = turnOrder[turnPos];

  // 테스트버전/비회원도 자기 말 밑에 보일 임시 닉네임을 직접 정할 수 있게 함.
  // 본인(myPlayer) 캐릭터에만 적용되고, 다른 캐릭터는 원본 이미지 카드 이름을 그대로 씀.
  function nameFor(pi: number) {
    if (pi === myPlayer && customNickname.trim()) return customNickname.trim();
    return PLAYER_DEFS[pi].name;
  }

  // START 버튼을 누르면 원본 체스말 4개(그대로 복사해 둔 조각 이미지)가 전부
  // START 버튼 자리까지 날아와 모인 뒤 캐릭터 선택 화면으로 넘어감.
  function handleStart() {
    if (startFlying) return;
    setStartFlying(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setStartEntered(true)));
    setTimeout(() => {
      setGameStarted(true);
      setStartFlying(false);
      setStartEntered(false);
    }, 1050);
  }

  // 회원가입 없이 바로 체험할 수 있게, 로그인 페이지와 동일한 테스트버전 로그인을
  // "회원가입이 필요해요" 팝업에서도 바로 할 수 있게 함.
  async function handleTestLogin() {
    setTestLoggingIn(true);
    try {
      await signIn("credentials", { testLogin: "1", redirect: false });
      setShowSignupPrompt(false);
    } finally {
      setTestLoggingIn(false);
    }
  }

  function resetGame() {
    setState(initialGameState(shuffledOrder()));
    setAnimPos({});
    setDiceFace(null);
    setRolling(false);
    setDiceEntered(false);
    setDiceSpinning(false);
  }

  async function chooseCharacter(idx: number) {
    setMyPlayer(idx);
    const nickname = customNickname.trim() || PLAYER_DEFS[idx].name;
    if (session?.user) {
      try {
        await fetch("/api/profile/nickname", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nickname }),
        });
        await updateSession({ name: nickname });
      } catch {
        // 닉네임 갱신 실패해도 게임 진행에는 지장 없음
      }
    }

    // AI루다가 화면을 할퀴며 순서를 제비뽑기하는 연출 (3초)
    setDrawingTurn(true);
    setState((prev) => ({ ...prev, turnOrder: shuffledOrder(), turnPos: 0 }));
    setTimeout(() => setDrawingTurn(false), 3000);
  }

  function commitRoll(dice: number) {
    setState((prev) => {
      if (prev.winner !== null) return prev;

      const cp = prev.turnOrder[prev.turnPos];
      const players = prev.players.map((p) => ({ ...p, owned: [...p.owned] }));
      const player = players[cp];
      player.totalSteps += dice;
      player.money += dice * MONEY_PER_STEP;

      const landedIndex = player.totalSteps % TOTAL_TILES;
      const tile = tiles[landedIndex];

      let ownerOf = prev.ownerOf;
      if (tile.type === "property" && ownerOf[landedIndex] === undefined) {
        player.owned.push(landedIndex);
        ownerOf = { ...ownerOf, [landedIndex]: cp };
      }

      const laps = Math.floor(player.totalSteps / TOTAL_TILES);
      const playerName = nameFor(cp);
      const log = [
        `${playerName}: 주사위 ${dice} → ${tile.label}${tile.type === "property" ? ` (₩${tile.price})` : ""}`,
        ...prev.log,
      ].slice(0, 8);

      const winner = laps >= LAPS_TO_WIN ? cp : null;
      const turnPos = winner === null ? (prev.turnPos + 1) % prev.turnOrder.length : prev.turnPos;

      return { players, ownerOf, turnOrder: prev.turnOrder, turnPos, lastDice: dice, winner, log };
    });
  }

  function rollDice() {
    if (!session?.user) {
      setShowSignupPrompt(true);
      return;
    }
    if (rolling || winner !== null) return;

    const dice = 1 + Math.floor(Math.random() * 6);
    const cp = currentPlayer;
    const startSteps = players[cp].totalSteps;

    // 1) 주사위가 화면 밖에서 맵 중앙으로 날아 들어오면서 실시간으로 구르는 연출
    setRolling(true);
    setDiceSpinning(true);
    setDiceEntered(false);
    setDiceFace(1 + Math.floor(Math.random() * 6));
    requestAnimationFrame(() => requestAnimationFrame(() => setDiceEntered(true)));

    let spinTicks = 0;
    const spinTimer = setInterval(() => {
      setDiceFace(1 + Math.floor(Math.random() * 6));
      spinTicks++;
      if (spinTicks >= 9) {
        clearInterval(spinTimer);
        // 2) 착지 + 실제 숫자로 확정 (아직 실제 위치는 안 바꾸고, 지금 있는 칸에 고정해둠 —
        //    나중에 실제 상태가 먼저 바뀌어서 순간이동처럼 보이는 걸 방지)
        setDiceSpinning(false);
        setDiceFace(dice);
        setAnimPos((prev) => ({ ...prev, [cp]: startSteps % TOTAL_TILES }));

        // 3) 한 칸씩 실제로 걸어서 이동
        // (한 칸 이동 트랜지션이 완전히 끝난 뒤에 다음 칸으로 넘어가도록,
        //  간격을 트랜지션 시간보다 넉넉히 길게 잡아 "한칸 한칸" 확실히 보이게 함)
        setTimeout(() => {
          let step = 0;
          const walkTimer = setInterval(() => {
            step++;
            setAnimPos((prev) => ({ ...prev, [cp]: (startSteps + step) % TOTAL_TILES }));
            if (step >= dice) {
              clearInterval(walkTimer);
              // 4) 다 걸어온 뒤에야 실제 게임 상태(칸 수·마일리지·소유·턴)를 한 번에 확정
              commitRoll(dice);
              setTimeout(() => {
                setAnimPos((prev) => {
                  const next = { ...prev };
                  delete next[cp];
                  return next;
                });
                setRolling(false);
                setDiceEntered(false);
                setDiceFace(null);
                // 말이 칸에 도착하면 그 칸을 확대한 큰 팝업이 자동으로 뜸
                setSceneTile((startSteps + dice) % TOTAL_TILES);
              }, 350);
            }
          }, 420);
        }, 300);
      }
    }, 90);
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
            onClick={handleStart}
            disabled={startFlying}
            className="assa-start-btn absolute rounded-full bg-gradient-to-b from-pink-400 to-pink-500 px-7 py-3 text-xl font-extrabold text-white shadow-[0_6px_0_#db2777] active:translate-y-1 active:shadow-none disabled:opacity-70"
            style={{ top: "33%", left: "49%", transform: "translate(-50%, -50%)" }}
          >
            START 🐾
          </button>

          {/* START를 누르면 원본 체스말 4개(그대로 복사해 둔 조각 이미지)가 전부
              START 버튼 자리로 날아와 모임 */}
          {startFlying &&
            PLAYER_DEFS.map((p, pi) => {
              const offset = [
                { left: -7, top: -6 },
                { left: 7, top: -6 },
                { left: -7, top: 6 },
                { left: 7, top: 6 },
              ][pi];
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={`/tokens/piece-${pi}.png`}
                  alt=""
                  className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-40 drop-shadow-2xl ${startEntered ? "assa-dice-land" : ""}`}
                  style={{
                    left: `${49 + offset.left}%`,
                    top: startEntered ? `${33 + offset.top}%` : "118%",
                    width: `${(PIECE_BBOX[pi].width / BOARD_IMG_W) * 100}%`,
                    transitionProperty: "top",
                    transitionDuration: "750ms",
                    transitionDelay: `${pi * 60}ms`,
                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              );
            })}

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
            { href: "/signup", left: 33.2, top: 95.8, width: 25.4, height: 2.15 },
          ].map((nav, i) => (
            <Link
              key={i}
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

      {gameStarted && myPlayer === null && (
        <section
          className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12"
          style={{
            background:
              "linear-gradient(180deg, #bfe6a8 0%, #d9edc2 20%, #e8dcc0 45%, #c9a876 100%)",
          }}
        >
          <button
            type="button"
            onClick={() => setGameStarted(false)}
            className="self-start rounded-full border border-zinc-400 bg-white/80 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white"
          >
            ← 이전 화면으로
          </button>
          <h2 className="text-2xl font-extrabold text-amber-900">내 캐릭터를 골라주세요 🐾</h2>
          <p className="-mt-4 text-sm text-amber-800">
            선택한 고양이의 이름이 내 닉네임이 돼요!
          </p>

          <div className="flex w-full max-w-2xl flex-col gap-1.5">
            <label className="text-sm font-bold text-amber-900">
              내 임시 닉네임 (선택 — 비워두면 캐릭터 이름 그대로 사용해요)
            </label>
            <input
              type="text"
              value={customNickname}
              onChange={(e) => setCustomNickname(e.target.value.slice(0, 12))}
              placeholder="내 말 밑에 표시될 닉네임을 적어보세요"
              className="rounded-full border border-amber-300 bg-white/90 px-4 py-2 text-sm text-amber-900 placeholder:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {PLAYER_DEFS.map((p, pi) => (
              <button
                key={p.id}
                type="button"
                onClick={() => chooseCharacter(pi)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-4 bg-white/90 p-4 shadow-md transition-transform hover:scale-105 ${p.ring}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.name} className="h-20 w-20 rounded-full object-cover object-top" />
                <span className={`font-bold ${p.text}`}>{p.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {gameStarted && myPlayer !== null && drawingTurn && (
        <section className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-black">
          <div className="assa-claw-mark assa-claw-mark-1" />
          <div className="assa-claw-mark assa-claw-mark-2" />
          <div className="assa-claw-mark assa-claw-mark-3" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ai-ruda.png"
            alt="AI루다"
            className="animate-angry-shake h-40 w-40 object-contain drop-shadow-[0_0_30px_rgba(255,0,80,0.6)]"
          />
          <p className="mt-4 text-lg font-extrabold text-white">
            AI루다가 순서를 뽑는 중이다냥...! 🐾
          </p>
        </section>
      )}

      {gameStarted && myPlayer !== null && !drawingTurn && (
        <section
          className="flex flex-1 flex-col items-center gap-4 px-4 pb-10 pt-6"
          style={{
            background:
              "linear-gradient(180deg, #bfe6a8 0%, #d9edc2 20%, #e8dcc0 45%, #c9a876 100%)",
          }}
        >
          <button
            type="button"
            onClick={() => setGameStarted(false)}
            className="self-start rounded-full border border-zinc-400 bg-white/80 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white"
          >
            ← 이전 화면으로
          </button>

          {/* 챗GPT가 만들어준 "말 없는 보드만" 이미지를 배경으로 쓰고, 그 위에 체스말/클릭영역만 얹기 */}
          <div className="relative mx-auto w-full max-w-3xl" style={{ aspectRatio: "1 / 1" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/board-scenic.png"
              alt="아싸게임 보드"
              className="h-full w-full select-none object-contain"
              draggable={false}
            />

            {/* 20칸 클릭 영역 (칸 정보 미리보기) — 칸 크기(가로 약 13.5%)를 넘지 않게 */}
            {tiles.map((tile, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSceneTile(idx)}
                aria-label={tile.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${TILE_POS[idx].left}%`,
                  top: `${TILE_POS[idx].top}%`,
                  width: "12%",
                  height: "12%",
                }}
              />
            ))}

            {/* 원본 체스말 4개(그대로 복사해 둔 조각 이미지)를 칸 중앙 안에 들어가는 크기로 이동시킴 —
                바닥에 타원 그림자를 깔아 보드 위에 자연스럽게 서 있는 느낌을 살림 */}
            {PLAYER_DEFS.map((p, pi) => {
              const pos = animPos[pi] !== undefined ? animPos[pi] : players[pi].totalSteps % TOTAL_TILES;
              const isWalking = animPos[pi] !== undefined;
              const widthPct = PIECE_WIDTH_PCT_BOARD2[pi];
              const nickname = pi === myPlayer ? customNickname.trim() : "";
              return (
                <div
                  key={p.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 ${isWalking ? "scale-110" : ""}`}
                  style={{
                    left: `${TILE_POS[pos].left + (pi % 2 === 0 ? -1.2 : 1.2)}%`,
                    top: `${TILE_POS[pos].top + (pi < 2 ? -1.1 : 1.1)}%`,
                    width: `${widthPct}%`,
                    zIndex: 10,
                    transitionProperty: "left, top, transform",
                    transitionDuration: "0.35s",
                    transitionTimingFunction: "ease",
                  }}
                >
                  {/* 바닥 타원 그림자 — 칸 중앙에 딱 붙어 서 있는 느낌을 살림 */}
                  <div
                    className="absolute rounded-[50%] bg-black/45 blur-[3px]"
                    style={{ left: "50%", bottom: "4%", width: "58%", height: "13%", transform: "translateX(-50%)" }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/tokens/piece-${pi}.png`}
                    alt={p.name}
                    className="relative w-full"
                    style={{ filter: "drop-shadow(3px 10px 5px rgba(0,0,0,0.4))" }}
                  />
                  {nickname && (
                    <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-amber-100 sm:text-xs">
                      {nickname}
                    </span>
                  )}
                </div>
              );
            })}

            {/* 원본 주사위 그림(그대로 복사해 둔 이미지)이 밖에서 맵 중앙으로 날아들어와 구름.
                주사위 그림과 실제 숫자를 겹치지 않게 분리해서, 숫자는 주사위 위쪽에 별도 배지로 표시 */}
            {rolling && (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-40"
                style={{
                  left: diceEntered ? "50%" : "-15%",
                  top: diceEntered ? "50%" : "-15%",
                  width: "13%",
                  aspectRatio: "1 / 1",
                  transitionProperty: "left, top",
                  transitionDuration: "550ms",
                  transitionTimingFunction: "ease-out",
                }}
              >
                <div className={`h-full w-full drop-shadow-2xl ${diceSpinning ? "assa-dice-spin" : "assa-dice-land"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/tokens/dice.png" alt="" className="h-full w-full" />
                </div>
                {!diceSpinning && diceFace !== null && (
                  <div
                    className="absolute left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-pink-500 shadow-lg"
                    style={{ top: "-8%" }}
                  >
                    <span className="text-base font-extrabold text-white">{diceFace}</span>
                  </div>
                )}
              </div>
            )}

            {/* 출발 칸: 현재 턴 플레이어가 1바퀴 이상 돌았으면 그 바퀴 수를 배지로 표시 */}
            {Math.floor(players[currentPlayer].totalSteps / TOTAL_TILES) >= 1 && (
              <div
                className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pink-500 font-extrabold text-white shadow-lg"
                style={{ left: `${TILE_POS[0].left}%`, top: `${TILE_POS[0].top}%`, width: "5.5%", aspectRatio: "1 / 1" }}
              >
                {Math.floor(players[currentPlayer].totalSteps / TOTAL_TILES)}
              </div>
            )}

            {/* 내가 이겼으면 WIN, 남이 이겼으면 LOSE 화면을 내 화면 기준으로 보여줌 */}
            {winner !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
                {winner === myPlayer ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 px-10 py-8 text-center shadow-2xl">
                    <p className="text-4xl font-black tracking-widest text-amber-900">WIN 🏆</p>
                    <p className="text-lg font-extrabold text-amber-900">{nameFor(winner)} 승리!</p>
                    <p className="text-sm text-amber-800">
                      보유한 땅 {players[winner].owned.length}곳 · 최종 마일리지 {winnerMileage}점
                    </p>
                    <button
                      type="button"
                      onClick={resetGame}
                      className="mt-2 rounded-full bg-zinc-900 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700"
                    >
                      다시 하기
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-b from-zinc-500 to-zinc-700 px-10 py-8 text-center shadow-2xl">
                    <p className="text-4xl font-black tracking-widest text-white">LOSE 😿</p>
                    <p className="text-lg font-extrabold text-zinc-100">{nameFor(winner)} 승리!</p>
                    <p className="text-sm text-zinc-300">다음엔 꼭 이겨봐요!</p>
                    <button
                      type="button"
                      onClick={resetGame}
                      className="mt-2 rounded-full bg-white px-6 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-200"
                    >
                      다시 하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 보드 이미지에 더 이상 없는 턴 표시/주사위 버튼/카드/기록창을 코드로 구현 */}
          <div className="flex w-full max-w-3xl flex-col items-center gap-3">
            <div className="rounded-full bg-[#2b2210] px-5 py-2">
              <span className="text-sm font-bold text-amber-100">
                현재 턴: {nameFor(currentPlayer)}
                {myPlayer === currentPlayer && " (나)"}
              </span>
            </div>

            <button
              type="button"
              onClick={rollDice}
              disabled={winner !== null || rolling}
              className="relative rounded-full bg-green-600 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
            >
              🎲 주사위 굴리기
              {!rolling && lastDice !== null && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-extrabold text-white shadow">
                  {lastDice}
                </span>
              )}
            </button>

            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {PLAYER_DEFS.map((p, pi) => {
                const laps = Math.min(Math.floor(players[pi].totalSteps / TOTAL_TILES), LAPS_TO_WIN);
                return (
                  <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/90 p-2 text-sm shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/tokens/piece-${pi}.png`} alt={p.name} className="h-9 w-9 object-contain" />
                    <div className="text-xs">
                      <p className="font-bold text-amber-900">{nameFor(pi)}</p>
                      <p className="text-zinc-600">
                        바퀴 {laps}/{LAPS_TO_WIN} · 🪙{players[pi].money} · 땅 {players[pi].owned.length}곳
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex max-h-28 w-full flex-col gap-1 overflow-y-auto rounded-xl bg-[#fdf6e8]/95 p-3 shadow-inner">
              {log.length === 0 ? (
                <p className="text-xs text-zinc-600 sm:text-sm">주사위를 굴려 게임을 시작해보세요.</p>
              ) : (
                log.map((line, i) => (
                  <p key={i} className="text-xs text-zinc-700 sm:text-sm">
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* 하단 버튼 (이미지 밖 추가 기능) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/coming-soon/shop"
              className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
            >
              상점 가기
            </Link>
            <Link
              href="/community"
              className="rounded-full border border-zinc-400 bg-white/90 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-white"
            >
              💬 대화하기
            </Link>
            <button
              type="button"
              onClick={() => {
                fetch("/api/cheer", { method: "POST" }).catch(() => {});
              }}
              className="rounded-full border border-pink-300 bg-white/90 px-4 py-2 text-xs font-medium text-pink-600 hover:bg-white"
            >
              🩷 응원하기
            </button>
            <Link
              href="/home"
              className="text-sm text-zinc-500 underline hover:text-zinc-800"
            >
              건너뛰기 → 루다월드 홈으로
            </Link>
          </div>

          {/* 말이 칸에 도착하면(자동) 또는 칸을 클릭하면, 그 칸을 확대한 큰 팝업 + 선택지 2칸이 뜸 */}
          {sceneTile !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setSceneTile(null)}
            >
              <div
                className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const tile = tiles[sceneTile];
                  return (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={TILE_IMG(sceneTile)}
                        alt={tile.label}
                        className="h-64 w-full object-cover"
                      />
                      <div className="p-5 text-center">
                        <p className="text-xl font-extrabold text-amber-900">{tile.label}</p>
                        {tile.price && (
                          <p className="mt-1 text-sm font-bold text-amber-700">₩{tile.price}</p>
                        )}

                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setSceneTile(null)}
                            className="rounded-2xl border-2 border-pink-300 bg-pink-50 px-4 py-3 text-sm font-bold text-pink-700 hover:bg-pink-100"
                          >
                            닝겐 날 간택하라냥! 🐾
                          </button>
                          <button
                            type="button"
                            onClick={() => setSceneTile(null)}
                            className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            닝겐 날 따르라냥! 🐾
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSceneTile(null)}
                          className="mt-4 rounded-full bg-zinc-900 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700"
                        >
                          닫기
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {showSignupPrompt && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setShowSignupPrompt(false)}
            >
              <div
                className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-4xl">🔒</p>
                <p className="mt-3 text-lg font-extrabold text-amber-900">
                  회원가입이 필요해요
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  주사위를 던지려면 먼저 루다월드에 가입해주세요!
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSignupPrompt(false)}
                    className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    닫기
                  </button>
                  <Link
                    href="/signup"
                    className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white hover:bg-zinc-700"
                  >
                    회원가입 하러가기
                  </Link>
                  <button
                    type="button"
                    onClick={handleTestLogin}
                    disabled={testLoggingIn}
                    className="rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                  >
                    {testLoggingIn ? "접속 중..." : "🧪 테스트 로그인"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
