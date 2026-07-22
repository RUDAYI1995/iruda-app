"use client";

import { useEffect, useState } from "react";
import { StartChatButton } from "./StartChatButton";

type Match = {
  userId: string;
  name: string;
  needsRental: boolean;
  score: number;
};

export function AnimalCompanionButton() {
  const [open, setOpen] = useState(false);
  const [soloTravel, setSoloTravel] = useState(false);
  const [soloRental, setSoloRental] = useState(false);
  const [groupTravel, setGroupTravel] = useState(false);
  const [groupRental, setGroupRental] = useState(false);
  const [saved, setSaved] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loginRequired, setLoginRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/animal-companion");
    if (res.status === 401) {
      setLoginRequired(true);
      setLoading(false);
      return;
    }
    setLoginRequired(false);
    const data = await res.json();
    if (data.request) {
      setSoloTravel(data.request.soloTravel);
      setSoloRental(data.request.soloRental);
      setGroupTravel(data.request.groupTravel);
      setGroupRental(data.request.groupRental);
    }
    setMatches(data.matches ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() fetches and syncs server state on open
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = async () => {
    const res = await fetch("/api/animal-companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soloTravel, soloRental, groupTravel, groupRental }),
    });
    if (!res.ok) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-[#a9744f] bg-[#f5ebe0] px-2.5 py-1.5 text-xs font-medium text-[#6b4226] shadow-sm transition-transform hover:scale-105 dark:border-[#8a5a35] dark:bg-[#3b2a1e]/50 dark:text-[#e8c9a0]"
      >
        <span className="relative text-sm">
          🐕
          <span className="absolute -right-2 -top-2 text-[9px]">💬</span>
        </span>
        동물동행제
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  🐕 동물동행제
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  사람보다 동물과의 여행이 편한 분들을 위한 동물동반 여행 매칭이에요.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {loginRequired ? (
              <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                로그인 후 동물동행제 매칭을 신청할 수 있어요.
              </p>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-3 rounded-2xl border border-[#d8b892] bg-[#f5ebe0]/50 p-4 dark:border-[#6b4226] dark:bg-[#3b2a1e]/20">
                    <div className="flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-[#e3c9a8] to-[#a9744f] text-4xl dark:from-[#6b4226]/40 dark:to-[#3b2a1e]/40">
                      <span>🧑</span>
                      <span className="mx-1 text-lg">🤍</span>
                      <span>🐕</span>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={soloTravel}
                        onChange={(e) => setSoloTravel(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                      />
                      혼자 동물과 여행가기
                    </label>
                    <label className="ml-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={soloRental}
                        onChange={(e) => setSoloRental(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700"
                      />
                      동물 대여 필요
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900 dark:bg-sky-950/20">
                    <div className="flex h-28 items-center justify-center gap-0.5 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-200 text-2xl dark:from-sky-900/40 dark:to-emerald-900/40">
                      <span>🧑</span>
                      <span>🐕</span>
                      <span>🧑‍🦱</span>
                      <span>🐈</span>
                      <span>🧑‍🦳</span>
                      <span>🐇</span>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={groupTravel}
                        onChange={(e) => setGroupTravel(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                      />
                      여럿이 동물과 함께 여행가기
                    </label>
                    <label className="ml-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={groupRental}
                        onChange={(e) => setGroupRental(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700"
                      />
                      동물 대여 필요
                    </label>
                  </div>
                </div>

                <button
                  onClick={save}
                  className="mt-5 w-full rounded-full bg-[#a9744f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8a5a35]"
                >
                  선택 저장하기
                </button>
                {saved && (
                  <p className="mt-2 text-center text-xs text-emerald-600 dark:text-emerald-400">
                    저장됐어요 🐾
                  </p>
                )}

                {groupTravel && (
                  <div className="mt-5">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      나와 맞는 동물동행 후보
                    </h3>
                    {loading ? (
                      <p className="text-sm text-zinc-400">불러오는 중...</p>
                    ) : matches.length === 0 ? (
                      <p className="text-sm text-zinc-400">
                        아직 매칭 후보가 없어요. 다른 분이 신청하면 여기에 보여드릴게요.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {matches.map((m) => (
                          <div
                            key={m.userId}
                            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {m.name}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                궁합 {Math.round(m.score)}점
                                {m.needsRental && " · 동물 대여 필요"}
                              </p>
                            </div>
                            <StartChatButton
                              otherUserId={m.userId}
                              label="대화 신청"
                              className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
