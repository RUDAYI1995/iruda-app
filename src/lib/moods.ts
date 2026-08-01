export type Mood = {
  key: string;
  emoji: string;
  bg: string;
  label: string;
};

export const MOODS: Mood[] = [
  {
    key: "sensitive",
    emoji: "⚡",
    bg: "bg-gradient-to-br from-zinc-700 to-zinc-900",
    label: "나 오늘 예민하니까 건들지마",
  },
  {
    key: "shoo",
    emoji: "🥶",
    bg: "bg-gradient-to-br from-cyan-400 to-blue-600",
    label: "훠이훠이 저리가~",
  },
  {
    key: "calm",
    emoji: "🌾",
    bg: "bg-gradient-to-br from-lime-300 to-emerald-400",
    label: "기분 소소~",
  },
  {
    key: "happy",
    emoji: "🌊",
    bg: "bg-gradient-to-br from-sky-300 to-pink-300",
    label: "너무 행복해~",
  },
];
