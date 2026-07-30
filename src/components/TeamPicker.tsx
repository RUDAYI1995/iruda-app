"use client";

import { useEffect, useState } from "react";

export interface UserHit {
  id: string;
  name: string;
}

export function TeamPicker({
  teamName,
  onTeamNameChange,
  members,
  onAdd,
  onRemove,
}: {
  teamName: string;
  onTeamNameChange: (name: string) => void;
  members: UserHit[];
  onAdd: (u: UserHit) => void;
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<UserHit[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setHits(await res.json());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <input
        value={teamName}
        onChange={(e) => onTeamNameChange(e.target.value)}
        placeholder="팀 이름"
        className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
      />
      <div className="flex flex-wrap gap-1.5">
        {members.map((m) => (
          <span
            key={m.id}
            className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
          >
            {m.name}
            <button type="button" onClick={() => onRemove(m.id)} className="text-amber-500">
              ✕
            </button>
          </span>
        ))}
        {members.length === 0 && <p className="text-xs text-zinc-400">아직 팀원이 없어요.</p>}
      </div>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="닉네임으로 팀원 검색 후 추가"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {hits.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
            {hits.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => {
                    onAdd(u);
                    setQuery("");
                    setHits([]);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {u.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
