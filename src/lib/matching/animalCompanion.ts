import type { AxisScores } from "./scoring";
import { axisSimilarity, jaccardSimilarity } from "./meetup";

export interface CompanionCandidate {
  axisScores?: AxisScores;
  interests?: string[];
}

export function computeCompanionScore(a: CompanionCandidate, b: CompanionCandidate): number {
  const axis = a.axisScores && b.axisScores ? axisSimilarity(a.axisScores, b.axisScores) : 50;
  const interest =
    a.interests && b.interests ? jaccardSimilarity(a.interests, b.interests) : 0;
  return 0.6 * axis + 0.4 * interest;
}
