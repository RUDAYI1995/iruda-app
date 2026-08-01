import type { AxisScores } from "./scoring";
import { cosineSimilarity } from "@/lib/upstage/client";

export interface AnimalCompanionFlags {
  soloTravel: boolean;
  soloRental: boolean;
  groupTravel: boolean;
  groupRental: boolean;
}

export interface MatchableProfile {
  broadCategory: string;
  axisScores: AxisScores;
  interests: string[];
  pace: string;
  languages: string[];
  /** Upstage 임베딩 벡터 (성향테스트 제출 시 생성). 없으면 자카드 유사도만 사용 */
  interestEmbedding?: number[] | null;
  /** 오늘의 컨디션 키 — 둘 다 있으면 매칭 시 비슷한 컨디션끼리 우대 */
  moodKey?: string | null;
  /** 동물동행제 체크 항목 — 둘 다 있으면 비슷하게 체크한 사람끼리 우대 */
  animalCompanion?: AnimalCompanionFlags | null;
}

export function axisSimilarity(a: AxisScores, b: AxisScores): number {
  // EI는 2배 가중, 각 축 차이를 0~100 유사도로 변환 후 가중 평균
  const diffs = {
    EI: 100 - Math.abs(a.EI - b.EI),
    SN: 100 - Math.abs(a.SN - b.SN),
    TF: 100 - Math.abs(a.TF - b.TF),
    JP: 100 - Math.abs(a.JP - b.JP),
  };
  const weightedSum = diffs.EI * 2 + diffs.SN + diffs.TF + diffs.JP;
  return weightedSum / 5; // 가중치 합 5로 나눠 0~100 스케일 유지
}

export function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return (intersection / union) * 100;
}

// 자카드(완전 일치)만으로는 "바다"↔"스노클링" 같은 의미적으로 가까운 관심사를 못 잡아내서,
// Upstage 임베딩 코사인 유사도를 있으면 함께 반영한다 (50:50 블렌드). 임베딩이 없으면 기존 자카드만 사용.
function interestSimilarity(a: MatchableProfile, b: MatchableProfile): number {
  const jaccard = jaccardSimilarity(a.interests, b.interests);

  if (!a.interestEmbedding || !b.interestEmbedding) {
    return jaccard;
  }

  const cosine = cosineSimilarity(a.interestEmbedding, b.interestEmbedding);
  const embeddingScore = ((cosine + 1) / 2) * 100; // -1~1 → 0~100
  return jaccard * 0.5 + embeddingScore * 0.5;
}

function paceSimilarity(a: string, b: string): number {
  const order = ["여유로운", "보통", "부지런한"];
  const diff = Math.abs(order.indexOf(a) - order.indexOf(b));
  return 100 - diff * 50;
}

function languageOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  const overlap = a.filter((l) => setB.has(l)).length;
  return a.length === 0 ? 0 : (overlap / a.length) * 100;
}

// 둘 다 오늘의 컨디션을 체크했으면 반영, 아니면 중립(50)
function moodSimilarity(a?: string | null, b?: string | null): number {
  if (!a || !b) return 50;
  return a === b ? 100 : 30;
}

// 둘 다 동물동행제를 체크했으면 4개 체크박스 자카드 유사도로 반영, 아니면 중립(50)
function animalCompanionSimilarity(a?: AnimalCompanionFlags | null, b?: AnimalCompanionFlags | null): number {
  if (!a || !b) return 50;
  const keys: (keyof AnimalCompanionFlags)[] = ["soloTravel", "soloRental", "groupTravel", "groupRental"];
  const aFlags = keys.filter((k) => a[k]);
  const bFlags = keys.filter((k) => b[k]);
  if (aFlags.length === 0 && bFlags.length === 0) return 100;
  const intersection = aFlags.filter((k) => bFlags.includes(k)).length;
  const union = new Set([...aFlags, ...bFlags]).size;
  return union === 0 ? 100 : (intersection / union) * 100;
}

export function computePairScore(a: MatchableProfile, b: MatchableProfile): number {
  return (
    0.28 * axisSimilarity(a.axisScores, b.axisScores) +
    0.24 * interestSimilarity(a, b) +
    0.16 * paceSimilarity(a.pace, b.pace) +
    0.12 * languageOverlap(a.languages, b.languages) +
    0.1 * moodSimilarity(a.moodKey, b.moodKey) +
    0.1 * animalCompanionSimilarity(a.animalCompanion, b.animalCompanion)
  );
}

export function computeGroupScore(
  candidate: MatchableProfile,
  group: MatchableProfile[]
): number {
  if (group.length === 0) return 100;
  const scores = group.map((member) => computePairScore(candidate, member));
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export const MIN_GROUP_SCORE = 55;
