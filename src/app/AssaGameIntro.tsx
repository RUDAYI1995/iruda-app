"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

// 칸을 클릭하면 보여줄 귀여운 카드(이모지+그라데이션으로 표현한 미니 일러스트)
const TILE_ART: Record<string, { emoji: string; gradient: string; desc: string }> = {
  출발: { emoji: "🏁", gradient: "from-amber-200 to-amber-400", desc: "모든 여행의 시작점이에요!" },
  "마음 충전": { emoji: "🔋", gradient: "from-lime-200 to-lime-400", desc: "잠시 쉬면서 마음을 충전해요." },
  "심표 공간": { emoji: "😴", gradient: "from-indigo-200 to-indigo-400", desc: "쉿, 조용히 낮잠 자는 공간이에요." },
  "응원 공간": { emoji: "📣", gradient: "from-rose-200 to-rose-400", desc: "서로에게 응원의 한마디를 건네요." },
  "꿈의 도서관": { emoji: "📚", gradient: "from-sky-200 to-sky-400", desc: "포근한 담요를 덮고 책을 읽어요." },
  "고양이 카페": { emoji: "☕", gradient: "from-orange-200 to-orange-400", desc: "고양이와 함께 마시는 따뜻한 커피 한 잔." },
  "작은 공방": { emoji: "🎨", gradient: "from-fuchsia-200 to-fuchsia-400", desc: "나만의 작품을 만드는 아기자기한 공방." },
  "고요한 산책길": { emoji: "🌳", gradient: "from-emerald-200 to-emerald-400", desc: "새소리를 들으며 천천히 걷는 산책길." },
  "나눔 마켓": { emoji: "🎁", gradient: "from-pink-200 to-pink-400", desc: "따뜻한 물건을 나누는 작은 마켓." },
  "별빛 캠핑장": { emoji: "🏕️", gradient: "from-violet-200 to-violet-400", desc: "별을 보며 하룻밤 캠핑을 즐겨요." },
  "숲속 오두막": { emoji: "🛖", gradient: "from-teal-200 to-teal-400", desc: "숲 한가운데 아늑한 오두막." },
  "아기자기 공방": { emoji: "🧵", gradient: "from-rose-200 to-fuchsia-300", desc: "손끝에서 태어나는 소소한 소품들." },
  "음악이 흐르는 길": { emoji: "🎵", gradient: "from-blue-200 to-indigo-300", desc: "발걸음마다 음악이 흘러나오는 골목." },
  "행복 나눔 장터": { emoji: "🛍️", gradient: "from-yellow-200 to-orange-300", desc: "웃음이 넘치는 작은 장터예요." },
  "꽃길 마을": { emoji: "🌸", gradient: "from-pink-200 to-rose-300", desc: "꽃잎이 흩날리는 예쁜 마을길." },
  "동네 빵집": { emoji: "🥐", gradient: "from-amber-200 to-yellow-300", desc: "갓 구운 빵 냄새가 솔솔 나는 빵집." },
  "조용한 미술관": { emoji: "🖼️", gradient: "from-slate-200 to-zinc-300", desc: "말없이 그림을 감상하는 미술관." },
  "따뜻한 책방": { emoji: "📖", gradient: "from-amber-200 to-orange-300", desc: "따뜻한 조명 아래 작은 책방." },
  "바닷가 산책": { emoji: "🏖️", gradient: "from-cyan-200 to-blue-300", desc: "파도 소리를 들으며 걷는 바닷가." },
  "기차 여행": { emoji: "🚃", gradient: "from-red-200 to-rose-300", desc: "창밖 풍경을 보며 떠나는 기차 여행." },
};

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

// board-game-bg.png(1130x1392) 위 20칸의 실제 픽셀 중심좌표를 %로 환산한 표.
// buildTiles()의 idx 순서(우하단 코너부터 시계반대방향)와 1:1로 대응하도록 그리드 측정으로 좌표를 잡음.
const TILE_POS: { left: number; top: number }[] = [
  { left: 78.3, top: 59.6 }, // 0 우하단 코너
  { left: 60.2, top: 60.0 }, // 1 꿈의 도서관
  { left: 48.7, top: 60.0 }, // 2 고양이 카페
  { left: 38.9, top: 60.0 }, // 3 작은 공방
  { left: 29.2, top: 60.0 }, // 4 고요한 산책길
  { left: 24.3, top: 59.6 }, // 5 좌하단 코너
  { left: 24.3, top: 49.6 }, // 6 나눔 마켓
  { left: 24.3, top: 42.7 }, // 7 별빛 캠핑장
  { left: 24.3, top: 35.9 }, // 8 숲속 오두막
  { left: 24.3, top: 29.1 }, // 9 아기자기 공방
  { left: 24.3, top: 19.4 }, // 10 좌상단 코너
  { left: 34.5, top: 19.4 }, // 11 음악이 흐르는 길
  { left: 44.2, top: 19.4 }, // 12 행복 나눔 장터
  { left: 54.0, top: 19.4 }, // 13 꽃길 마을
  { left: 63.7, top: 19.4 }, // 14 동네 빵집
  { left: 78.3, top: 19.4 }, // 15 우상단 코너
  { left: 78.3, top: 29.1 }, // 16 조용한 미술관
  { left: 78.3, top: 35.9 }, // 17 따뜻한 책방
  { left: 78.3, top: 42.7 }, // 18 바닷가 산책
  { left: 78.3, top: 49.6 }, // 19 기차 여행
];

const BOARD_IMG_W = 1130;
const BOARD_IMG_H = 1392;

// board-game-bg.png 안에 원래부터 그려져 있는 체스말 4개의 실제 픽셀 영역.
// 새 그림을 만들지 않고, 이 영역만 창(overflow-hidden)으로 오려서 그대로 옮겨 움직이는 데 사용.
const PIECE_BBOX = [
  { left: 195, top: 165, width: 180, height: 225 }, // 초록 망토 (먼치)
  { left: 795, top: 170, width: 155, height: 220 }, // 왕관/빨강 (치즈)
  { left: 235, top: 565, width: 180, height: 220 }, // 핑크 드레스 (하다)
  { left: 695, top: 565, width: 180, height: 245 }, // 보라 마법사 (삼색이)
];

// board-game-bg.png 안에 원래 있는 주사위 소품(왼쪽 장식)의 픽셀 영역.
const DICE_PROP_BBOX = { left: 5, top: 388, width: 140, height: 115 };

// 원본 이미지 중 한 영역(bbox)만 오려서 보드 위 다른 위치(left/top %)에 그대로 옮겨 보여주는 컴포넌트.
// 새 이미지를 만들지 않고 같은 원본 파일(board-game-bg.png)을 창으로만 잘라서 재사용한다.
function BoardSprite({
  bbox,
  left,
  top,
  className,
  style,
}: {
  bbox: { left: number; top: number; width: number; height: number };
  left: number;
  top: number;
  className?: string;
  style?: CSSProperties;
}) {
  const widthPct = (bbox.width / BOARD_IMG_W) * 100;
  const heightPct = (bbox.height / BOARD_IMG_H) * 100;
  return (
    <div
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden ${className ?? ""}`}
      style={{ left: `${left}%`, top: `${top}%`, width: `${widthPct}%`, height: `${heightPct}%`, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/board-game-bg.png"
        alt=""
        draggable={false}
        className="absolute max-w-none select-none"
        style={{
          width: `${(BOARD_IMG_W / bbox.width) * 100}%`,
          height: `${(BOARD_IMG_H / bbox.height) * 100}%`,
          left: `${-(bbox.left / bbox.width) * 100}%`,
          top: `${-(bbox.top / bbox.height) * 100}%`,
        }}
      />
    </div>
  );
}

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
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [diceEntered, setDiceEntered] = useState(false);
  const [diceSpinning, setDiceSpinning] = useState(false);
  const [diceFace, setDiceFace] = useState<number | null>(null);
  const [animPos, setAnimPos] = useState<Record<number, number>>({});
  const refreshTick = useRefreshTick(5000);

  const { players, ownerOf, turnOrder, turnPos, lastDice, winner, log } = state;
  const currentPlayer = turnOrder[turnPos];

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
    if (session?.user) {
      try {
        await fetch("/api/profile/nickname", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: PLAYER_DEFS[idx].name }),
        });
        await updateSession({ name: PLAYER_DEFS[idx].name });
      } catch {
        // 닉네임 갱신 실패해도 게임 진행에는 지장 없음
      }
    }
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
      const playerName = PLAYER_DEFS[cp].name;
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
        // 2) 착지 + 실제 숫자로 확정
        setDiceSpinning(false);
        setDiceFace(dice);
        commitRoll(dice);

        // 3) 확정된 숫자만큼 원본 이미지 체스말이 한 칸씩 실제로 걸어서 이동
        setTimeout(() => {
          let step = 0;
          const walkTimer = setInterval(() => {
            step++;
            setAnimPos((prev) => ({ ...prev, [cp]: (startSteps + step) % TOTAL_TILES }));
            if (step >= dice) {
              clearInterval(walkTimer);
              setTimeout(() => {
                setAnimPos((prev) => {
                  const next = { ...prev };
                  delete next[cp];
                  return next;
                });
                setRolling(false);
                setDiceEntered(false);
                setDiceFace(null);
              }, 350);
            }
          }, 260);
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

      {gameStarted && myPlayer !== null && (
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

          {/* 체스말 이미지를 그대로 배경으로 쓰고, 그 위에 실제 게임 로직만 얹기 */}
          <div className="relative mx-auto w-full max-w-6xl" style={{ aspectRatio: "1130 / 1392" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/board-game-bg.png"
              alt="아싸게임 보드"
              className="h-full w-full select-none object-contain"
              draggable={false}
            />

            {/* 20칸 클릭 영역 (칸 정보 미리보기) */}
            {tiles.map((tile, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedTile(idx)}
                aria-label={tile.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${TILE_POS[idx].left}%`,
                  top: `${TILE_POS[idx].top}%`,
                  width: "11%",
                  height: "8%",
                }}
              />
            ))}

            {/* 원본 이미지 안에 원래 있는 체스말 4개를 창으로 오려서 그대로 옮겨 움직임 — 새로 만든 그림 없음 */}
            {PLAYER_DEFS.map((p, pi) => {
              const pos = animPos[pi] !== undefined ? animPos[pi] : players[pi].totalSteps % TOTAL_TILES;
              const isWalking = animPos[pi] !== undefined;
              return (
                <BoardSprite
                  key={p.id}
                  bbox={PIECE_BBOX[pi]}
                  left={TILE_POS[pos].left + (pi % 2 === 0 ? -6.5 : 6.5)}
                  top={TILE_POS[pos].top + (pi < 2 ? -6 : 6)}
                  className={`z-10 drop-shadow-lg transition-all duration-200 ease-out ${isWalking ? "scale-110" : ""}`}
                />
              );
            })}

            {/* 원본 이미지 속 주사위 소품을 그대로 오려서, 밖에서 맵 중앙으로 날아들어와 구르게 함 — 새 그림/패널 없음 */}
            {rolling && (
              <>
                <BoardSprite
                  bbox={DICE_PROP_BBOX}
                  left={diceEntered ? 51 : -15}
                  top={diceEntered ? 71 : -15}
                  className={`z-40 drop-shadow-2xl ${diceSpinning ? "assa-dice-spin" : "assa-dice-land"}`}
                  style={{ transitionProperty: "left, top", transitionDuration: "550ms", transitionTimingFunction: "ease-out" }}
                />
                {diceEntered && diceFace !== null && (
                  <span
                    className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 text-3xl font-extrabold text-pink-100"
                    style={{
                      left: "58%",
                      top: "65%",
                      textShadow:
                        "-1.5px -1.5px 0 #831843, 1.5px -1.5px 0 #831843, -1.5px 1.5px 0 #831843, 1.5px 1.5px 0 #831843, 0 2px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    {diceFace}
                  </span>
                )}
              </>
            )}

            {/* 현재 턴 표시 (이미지 위 placeholder 문구 자리) */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2b2210] px-4 py-1.5"
              style={{ left: "50%", top: "69.2%", width: "34%" }}
            >
              <span className="block truncate text-center text-xs font-bold text-amber-100 sm:text-sm">
                현재 턴: {PLAYER_DEFS[currentPlayer].name}
                {myPlayer === currentPlayer && " (나)"}
              </span>
            </div>

            {/* 주사위 굴리기 버튼 — 이미지에 그려진 버튼 위치에 그대로 클릭 영역만 얹기 */}
            <button
              type="button"
              onClick={rollDice}
              disabled={winner !== null || rolling}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full disabled:cursor-not-allowed"
              style={{ left: "51%", top: "72.6%", width: "24%", height: "4.6%" }}
              aria-label="주사위 굴리기"
            >
              {!rolling && lastDice !== null && (
                <span className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-extrabold text-white shadow">
                  {lastDice}
                </span>
              )}
            </button>

            {/* 4개 플레이어 카드의 동적 수치 (바퀴/마일리지/보유지) 덮어쓰기 */}
            {PLAYER_DEFS.map((p, pi) => {
              const laps = Math.min(Math.floor(players[pi].totalSteps / TOTAL_TILES), LAPS_TO_WIN);
              const cardLeft = [20.5, 39.6, 57.3, 76.4][pi];
              return (
                <div
                  key={p.id}
                  className="absolute flex -translate-x-1/2 flex-col items-center gap-0.5"
                  style={{ left: `${cardLeft}%`, top: "80.2%", width: "16%" }}
                >
                  <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
                    바퀴 {laps}/{LAPS_TO_WIN}
                  </span>
                  <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-200 sm:text-xs">
                    🪙{players[pi].money}
                  </span>
                  <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
                    땅 {players[pi].owned.length}곳
                  </span>
                </div>
              );
            })}

            {/* 진행 기록 — 원본 이미지의 기록창 자리를 그대로 확대해서 스크롤 가능하게 */}
            <div
              className="absolute flex -translate-x-1/2 flex-col gap-1 overflow-y-auto rounded-xl bg-[#fdf6e8]/95 px-3 py-2 shadow-inner"
              style={{ left: "50%", top: "87%", width: "72%", height: "12.5%" }}
            >
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

            {winner !== null && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/40 p-4"
              >
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-amber-100 px-8 py-6 text-center shadow-lg">
                  <p className="text-xl font-extrabold text-amber-900">
                    🏆 {PLAYER_DEFS[winner].name} 승리!
                  </p>
                  <p className="text-sm text-amber-800">
                    보유한 땅 {players[winner].owned.length}곳 · 최종 마일리지 {winnerMileage}점
                  </p>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700"
                  >
                    다시 하기
                  </button>
                </div>
              </div>
            )}
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

          {selectedTile !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setSelectedTile(null)}
            >
              <div
                className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const tile = tiles[selectedTile];
                  const art = TILE_ART[tile.label];
                  return (
                    <>
                      <div
                        className={`mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-b text-5xl shadow-inner ${art?.gradient ?? "from-zinc-200 to-zinc-300"}`}
                      >
                        {art?.emoji ?? "🐾"}
                      </div>
                      <p className="text-lg font-extrabold text-amber-900">{tile.label}</p>
                      {tile.price && (
                        <p className="mt-1 text-sm font-bold text-amber-700">₩{tile.price}</p>
                      )}
                      <p className="mt-2 text-sm text-zinc-600">{art?.desc}</p>
                    </>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => setSelectedTile(null)}
                  className="mt-5 rounded-full bg-zinc-900 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700"
                >
                  닫기
                </button>
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
                <div className="mt-5 flex justify-center gap-2">
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
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
