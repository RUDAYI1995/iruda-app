import type { AxisScores } from "./scoring";
import { axisSimilarity, jaccardSimilarity } from "./meetup";

export interface TravelerProfile {
  axisScores: AxisScores;
  interests: string[];
  budgetLevel: number; // 1~3
  languages: string[];
}

export interface GuideCandidate {
  id: string;
  languages: string[];
  region: string;
  hourlyRate: number;
  axisScores?: AxisScores | null;
  interests?: string[] | null;
}

function budgetFit(budgetLevel: number, hourlyRate: number): number {
  const expectedRate = budgetLevel * 15000;
  const diff = Math.abs(hourlyRate - expectedRate);
  return Math.max(0, 100 - diff / 500);
}

export function computeGuideScore(traveler: TravelerProfile, guide: GuideCandidate): number {
  const axis = guide.axisScores ? axisSimilarity(traveler.axisScores, guide.axisScores) : 50;
  const interests = guide.interests ? jaccardSimilarity(traveler.interests, guide.interests) : 0;
  const budget = budgetFit(traveler.budgetLevel, guide.hourlyRate);

  return 0.2 * axis + 0.15 * interests + 0.1 * budget;
}

/** 언어/지역 하드 필터 통과 후보만 남김 */
export function filterGuides<T extends { languages: string[]; region: string }>(
  guides: T[],
  { language, region }: { language?: string; region?: string }
): T[] {
  return guides.filter((g) => {
    if (language && !g.languages.includes(language)) return false;
    if (region && !g.region.toLowerCase().includes(region.toLowerCase())) return false;
    return true;
  });
}
