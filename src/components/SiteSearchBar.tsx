"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  title: string;
  href: string;
}

export function SiteSearchBar({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    const match = items.find((item) => item.title.toLowerCase().includes(q));
    if (match) {
      setNotFound(false);
      router.push(match.href);
    } else {
      setNotFound(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setNotFound(false);
        }}
        placeholder="루다월드에서 검색해보세요"
        className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        🔍
      </button>
      {notFound && (
        <p className="absolute left-0 top-full mt-1 text-xs text-red-500">
          일치하는 기능을 못 찾았어요
        </p>
      )}
    </form>
  );
}
