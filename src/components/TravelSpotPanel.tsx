"use client";

import type { TravelSpot } from "@/lib/familyTravelSpots";

export function TravelSpotPanel({
  eyebrow,
  title,
  spots,
  accentClass,
  closeButtonClass = "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900",
  onClose,
}: {
  eyebrow: string;
  title: string;
  spots: TravelSpot[];
  accentClass: string;
  closeButtonClass?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[500] bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${accentClass}`}>{eyebrow}</p>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${closeButtonClass}`}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {spots.map((spot) => (
            <div
              key={spot.name}
              className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spot.image} alt={spot.name} className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="mb-1 font-bold text-zinc-900 dark:text-zinc-50">{spot.name}</p>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {spot.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
