"use client";

import { useEffect, useState } from "react";

export interface LevelInfo {
  loggedIn: boolean;
  level?: number;
  title?: string;
  exp?: number;
  currentFloor?: number;
  nextFloor?: number;
  ratio?: number;
  gender?: "MALE" | "FEMALE" | "LGBTQ" | null;
  needsGender?: boolean;
}

export const GENDER_LABELS: Record<"MALE" | "FEMALE" | "LGBTQ", string> = {
  MALE: "남성",
  FEMALE: "여성",
  LGBTQ: "성소수자",
};

export function useLevelInfo() {
  const [info, setInfo] = useState<LevelInfo | null>(null);

  useEffect(() => {
    fetch("/api/level")
      .then((res) => res.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  return info;
}
