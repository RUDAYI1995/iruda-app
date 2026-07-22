export type Axis = "EI" | "SN" | "TF" | "JP";

export interface Question {
  id: string;
  step: number;
  axis: Axis;
  text: string;
  leftLabel: string;
  rightLabel: string;
}

// 답변 1~5: 1 = leftLabel에 가까움, 5 = rightLabel에 가까움
// 오른쪽(rightLabel)이 각 축의 두 번째 글자(I, N, F, P)에 대응
export const QUESTIONS: Question[] = [
  {
    id: "ei1",
    step: 1,
    axis: "EI",
    text: "낯선 사람들과 오래 있으면 에너지가 빠지는 느낌이 든다",
    leftLabel: "전혀 아니다",
    rightLabel: "매우 그렇다",
  },
  {
    id: "ei2",
    step: 1,
    axis: "EI",
    text: "혼자만의 시간이 있어야 다음 활동을 할 힘이 생긴다",
    leftLabel: "전혀 아니다",
    rightLabel: "매우 그렇다",
  },
  {
    id: "sn1",
    step: 2,
    axis: "SN",
    text: "여행 계획을 짤 때 구체적인 일정보다 전체적인 분위기/느낌을 먼저 떠올린다",
    leftLabel: "전혀 아니다",
    rightLabel: "매우 그렇다",
  },
  {
    id: "sn2",
    step: 2,
    axis: "SN",
    text: "새로운 장소에서도 상상력을 발휘해 의미를 부여하는 걸 좋아한다",
    leftLabel: "전혀 아니다",
    rightLabel: "매우 그렇다",
  },
  {
    id: "tf1",
    step: 3,
    axis: "TF",
    text: "동행의 기분이 상하지 않도록 하는 게 효율적인 결정보다 우선이다",
    leftLabel: "전혀 아니다",
    rightLabel: "매우 그렇다",
  },
  {
    id: "tf2",
    step: 3,
    axis: "TF",
    text: "낯선 사람과도 감정적인 공감대가 형성되면 마음이 편해진다",
    leftLabel: "전혀 아니다",
    rightLabel: "매우 그렇다",
  },
  {
    id: "jp1",
    step: 4,
    axis: "JP",
    text: "여행 중 갑작스러운 일정 변경이 생기면 스트레스를 받는다",
    leftLabel: "전혀 아니다",
    rightLabel: "매우 그렇다",
  },
  {
    id: "jp2",
    step: 4,
    axis: "JP",
    text: "미리 정해진 계획이 없으면 오히려 마음이 편하다",
    leftLabel: "매우 그렇다",
    rightLabel: "전혀 아니다",
  },
];

export const TOTAL_QUIZ_STEPS = 4;
export const STYLE_STEP = TOTAL_QUIZ_STEPS + 1;

export type AxisScores = Record<Axis, number>;

const AXIS_LETTERS: Record<Axis, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

export function computeAxisScores(answers: Record<string, number>): AxisScores {
  const scores: AxisScores = { EI: 0, SN: 0, TF: 0, JP: 0 };

  (["EI", "SN", "TF", "JP"] as Axis[]).forEach((axis) => {
    const qs = QUESTIONS.filter((q) => q.axis === axis);
    const total = qs.reduce((sum, q) => sum + (answers[q.id] ?? 3), 0);
    // 1~5 스케일 평균을 0~100으로 변환
    scores[axis] = Math.round(((total / qs.length - 1) / 4) * 100);
  });

  return scores;
}

export function codeFromScores(scores: AxisScores): string {
  return (["EI", "SN", "TF", "JP"] as Axis[])
    .map((axis) => {
      const [left, right] = AXIS_LETTERS[axis];
      return scores[axis] >= 50 ? right : left;
    })
    .join("");
}

export const BROAD_CATEGORIES = [
  {
    value: "CONFORMIST",
    label: "동조형",
    desc: "극I지만 비슷하게 소심한 사람끼리 있으면 오히려 용기가 나는 타입. 여행에서 만난 비슷한 성향의 사람들과 적극적으로 친해질 의향이 있다.",
  },
  {
    value: "SMALL_TALK",
    label: "스몰톡형",
    desc: "극I이고 낯선 사람과 안부/간단한 대화는 가능하지만 장기적·깊은 대화는 어렵다.",
  },
  {
    value: "COHABITANT",
    label: "공동생활형",
    desc: "극I이고 그룹과 함께 지내되, 개인적 자유행동 시간이 반드시 보장되어야 한다.",
  },
  {
    value: "TRANSIT_ONLY",
    label: "이동동행형",
    desc: "극I이고 이동(교통/숙소 이동)까지만 함께하고, 여행지 내 실제 활동은 개별로 움직이는 걸 선호한다.",
  },
] as const;

export const INTEREST_OPTIONS = [
  "역사",
  "맛집",
  "사진",
  "자연/풍경",
  "쇼핑",
  "미술관/박물관",
  "액티비티",
  "카페 투어",
];

export const PACE_OPTIONS = ["여유로운", "보통", "부지런한"] as const;
