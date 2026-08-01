"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  level: number;
  title: string;
  exp: number;
  mileage: number;
  activity: { posts: number; meetupsJoined: number; gamesWon: number };
  mood: { emoji: string; label: string } | null;
  animalCompanion: {
    soloTravel: boolean;
    soloRental: boolean;
    groupTravel: boolean;
    groupRental: boolean;
  } | null;
  closeness: number | null;
};

type View = "menu" | "level" | "house" | "activity" | "closeness";

export function UserActionMenu({
  userId,
  name,
  className,
}: {
  userId: string;
  name: string;
  className?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myInParty, setMyInParty] = useState<boolean | null>(null);
  const [amLeader, setAmLeader] = useState(false);
  const [targetInParty, setTargetInParty] = useState<boolean | null>(null);

  const isSelf = session?.user?.id === userId;

  async function openMenu() {
    setOpen(true);
    setView("menu");
    setMessage(null);
    if (!session?.user?.id) return;

    const [meRes, statusRes] = await Promise.all([
      fetch("/api/party/me"),
      fetch(`/api/party/status?userId=${userId}`),
    ]);
    const me = await meRes.json();
    const status = await statusRes.json();
    setMyInParty(!!me.party);
    setAmLeader(!!me.party?.isLeader);
    setTargetInParty(!!status.inParty);
  }

  async function loadProfile() {
    setLoading(true);
    const res = await fetch(`/api/users/${userId}/profile`);
    const data = await res.json();
    setLoading(false);
    if (res.ok) setProfile(data);
  }

  async function addFriend() {
    setLoading(true);
    const res = await fetch("/api/friends/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    setLoading(false);
    setMessage(res.ok ? "친구로 추가했어요 🐾" : "친구 추가에 실패했어요");
  }

  async function joinParty() {
    setLoading(true);
    const res = await fetch("/api/party/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? "파티에 참여했어요!" : data.error ?? "참여에 실패했어요");
    if (res.ok) {
      setMyInParty(true);
      router.refresh();
    }
  }

  async function proposeParty() {
    setLoading(true);
    const res = await fetch("/api/party/propose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? `${name}님에게 파티 제안을 보냈어요!` : data.error ?? "제안에 실패했어요");
  }

  function close() {
    setOpen(false);
    setView("menu");
    setMessage(null);
    setProfile(null);
  }

  if (isSelf) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={openMenu}
        className={className ?? "text-zinc-800 hover:underline dark:text-zinc-200"}
      >
        {name}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[250] bg-black/30"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto border-l border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{name}</p>
              <button
                onClick={close}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {view === "menu" && (
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={addFriend}
                  disabled={loading}
                  className="rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  🧑‍🤝‍🧑 친구 추가하기
                </button>
                <button
                  onClick={() => {
                    setView("level");
                    if (!profile) loadProfile();
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  ⭐ 레벨 보기
                </button>
                <button
                  onClick={() => {
                    setView("house");
                    if (!profile) loadProfile();
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  🏠 집 구경하기
                </button>
                <button
                  onClick={() => {
                    setView("activity");
                    if (!profile) loadProfile();
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  📜 활동이력보기
                </button>
                <button
                  onClick={() => {
                    setView("closeness");
                    if (!profile) loadProfile();
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  🧡 친목도 보기
                </button>
                {myInParty === false && (
                  <button
                    onClick={joinParty}
                    disabled={loading}
                    className="rounded-xl bg-sky-50 px-3 py-2 text-left text-sm font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-50 dark:bg-sky-950/30 dark:text-sky-300"
                  >
                    🎒 파티 참여하기
                  </button>
                )}
                {amLeader && targetInParty === false && (
                  <button
                    onClick={proposeParty}
                    disabled={loading}
                    className="rounded-xl bg-violet-50 px-3 py-2 text-left text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-50 dark:bg-violet-950/30 dark:text-violet-300"
                  >
                    📣 파티 제안하기
                  </button>
                )}
                {message && (
                  <p className="mt-1 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    {message}
                  </p>
                )}
              </div>
            )}

            {view !== "menu" && (
              <div>
                <button
                  onClick={() => setView("menu")}
                  className="mb-2 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  ← 메뉴로
                </button>

                {loading && !profile && (
                  <p className="text-sm text-zinc-400">불러오는 중...</p>
                )}

                {profile && view === "level" && (
                  <div className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
                    <p className="font-bold text-amber-800 dark:text-amber-200">
                      Lv.{profile.level} {profile.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      EXP {profile.exp.toFixed(1)} · 마일리지 {profile.mileage}
                    </p>
                  </div>
                )}

                {profile && view === "house" && (
                  <div className="rounded-xl bg-emerald-50 p-3 text-center text-sm dark:bg-emerald-950/20">
                    <p className="text-2xl">🏠</p>
                    <p className="mt-1 font-bold text-emerald-800 dark:text-emerald-200">
                      {profile.name}님의 집
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Lv.{profile.level} {profile.title} · 집 꾸미기 기능은 곧 채워질 예정이에요
                    </p>
                  </div>
                )}

                {profile && view === "activity" && (
                  <div className="flex flex-col gap-1.5 rounded-xl bg-sky-50 p-3 text-xs text-sky-800 dark:bg-sky-950/20 dark:text-sky-300">
                    <p>✍️ 작성한 게시글 {profile.activity.posts}개</p>
                    <p>🧭 참여한 정모 {profile.activity.meetupsJoined}개</p>
                    <p>🏆 게임 승리 {profile.activity.gamesWon}회</p>
                  </div>
                )}

                {profile && view === "closeness" && (
                  <div className="flex flex-col gap-2 rounded-xl bg-orange-50 p-3 text-xs text-orange-900 dark:bg-orange-950/20 dark:text-orange-200">
                    <p className="text-sm font-bold">🧡 나와의 친목도: {profile.closeness ?? 0}</p>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-black/20">
                      <p className="font-semibold">오늘 컨디션</p>
                      <p>{profile.mood ? `${profile.mood.emoji} ${profile.mood.label}` : "아직 체크 안 함"}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-2 dark:bg-black/20">
                      <p className="font-semibold">🐾 동물동행제</p>
                      {profile.animalCompanion ? (
                        <ul className="mt-1 list-disc pl-4">
                          {profile.animalCompanion.soloTravel && <li>혼자 여행 원함</li>}
                          {profile.animalCompanion.soloRental && <li>혼자 여행 시 대여 필요</li>}
                          {profile.animalCompanion.groupTravel && <li>동행 여행 원함</li>}
                          {profile.animalCompanion.groupRental && <li>동행 여행 시 대여 필요</li>}
                        </ul>
                      ) : (
                        <p>아직 체크 안 함</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
