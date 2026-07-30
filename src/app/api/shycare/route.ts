import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/upstage/client";
import { geocodeCity } from "@/lib/weather/openMeteo";

const BASE_PERSONA = `너는 "AI루다"야. 여행 매칭 플랫폼 '루다월드'의 마스코트 고양이 캐릭터로,
소심하고 내향적인 유저들을 다정하게 도와주는 상담원 역할이야.
말투는 다정하고 따뜻하게, 사람을 "닝겐"이라고 부르고 문장 끝에 가끔 "~냥"을 붙여.
답변은 3~6문장 이내로, 공감하면서도 실질적인 도움이 되도록 답해줘.`;

const TOPIC_PROMPTS: Record<string, string> = {
  heart: `${BASE_PERSONA}
지금 상담 주제는 "마음 상담"이야. 유저가 불안, 걱정, 스트레스 등 감정적인 이야기를 털어놓으면
먼저 공감해주고, 그 다음에 마음이 편해질 수 있는 작은 조언을 해줘. 진단이나 의학적 조언은 하지 말고,
힘든 감정을 들어주는 다정한 상담원처럼 반응해줘.`,
  travel: `${BASE_PERSONA}
지금 상담 주제는 "여행 고민 해결"이야. 유저가 여행 계획, 일정, 준비물, 동행 등에 대한 고민을 말하면
구체적이고 실용적인 여행 조언을 해줘. 필요하면 되물어서 여행지, 기간, 인원 등을 파악하고 맞춤 조언을 해줘.`,
  relationship: `${BASE_PERSONA}
지금 상담 주제는 "대인관계 상담"이야. 유저가 친구, 연인, 가족, 여행 동행자와의 관계 고민을 말하면
판단하지 말고 공감하면서, 소심한 성격도 존중하는 선에서 현실적인 조언을 해줘.`,
  courage: `${BASE_PERSONA}
지금 상담 주제는 "용기 충전"이야. 유저가 자신 없어 하거나 망설이는 일을 말하면,
따뜻하고 힘이 나는 응원의 말을 해줘. 과장되지 않게, 진심 어린 응원 메시지를 담아서 답해줘.`,
};

const RECOMMEND_KEYWORDS = [
  "nature",
  "beach",
  "city",
  "mountain",
  "hotspring",
  "cafe",
  "forest",
  "island",
  "snow",
  "temple",
  "market",
  "bakery",
  "bookstore",
  "artgallery",
  "camping",
  "train",
  "flower",
  "lake",
] as const;

function u(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=70`;
}

const KEYWORD_PHOTOS: Record<(typeof RECOMMEND_KEYWORDS)[number], string> = {
  nature: u("photo-1441974231531-c6227db76b6e"),
  beach: u("photo-1507525428034-b723cf961d3e"),
  city: u("photo-1480714378408-67cf0d13bc1b"),
  mountain: u("photo-1506905925346-21bda4d32df4"),
  hotspring: u("photo-1535530992830-e25d07cfa780"),
  cafe: u("photo-1495474472287-4d71bcdd2085"),
  forest: u("photo-1592859600972-1b0834d83747"),
  island: u("photo-1573790387438-4da905039392"),
  snow: u("photo-1491002052546-bf38f186af56"),
  temple: u("photo-1478436127897-769e1b3f0f36"),
  market: u("photo-1569925493302-dde995240688"),
  bakery: u("photo-1568254183919-78a4f43a2877"),
  bookstore: u("photo-1533327325824-76bc4e62d560"),
  artgallery: u("photo-1575223970966-76ae61ee7838"),
  camping: u("photo-1504851149312-7a075b496cc7"),
  train: u("photo-1580442374555-3def8fb41738"),
  flower: u("photo-1490750967868-88aa4486c946"),
  lake: u("photo-1439853949127-fa647821eba0"),
};

const RECOMMEND_SYSTEM = `${BASE_PERSONA}
지금 상담 주제는 "맞춤 추천 서비스"야. 유저가 자신의 성향, 관심사, 원하는 여행 스타일을 말하면
그에 어울리는 여행지·활동·힐링 방법을 정확히 3개 추천해줘.

반드시 아래 JSON 형식으로만 답해. 다른 설명이나 인사말은 절대 붙이지 마:
{"intro":"한 문장으로 유저에게 건네는 다정한 인트로","picks":[{"title":"추천 이름(10자 내외)","summary":"왜 이 유저에게 어울리는지 2문장 이내 요약","keyword":"아래 목록 중 하나","place":"실제로 존재하는 구체적인 지명(시/도 또는 국가까지 포함, 예: '강원도 양양군', '제주 사려니숲', '태국 방콕')"}]}

keyword는 반드시 다음 중 하나만 사용해: ${RECOMMEND_KEYWORDS.join(", ")}
place는 반드시 실제로 존재하는 지명이어야 하고, 지도에서 검색 가능한 수준으로 구체적이어야 해.`;

type RawPick = { title?: string; summary?: string; keyword?: string; place?: string };
type Pick = {
  title: string;
  summary: string;
  keyword: string;
  image: string;
  place: string;
  mapUrl: string;
  latitude: number | null;
  longitude: number | null;
};

async function parseRecommendReply(raw: string): Promise<{ intro: string; picks: Pick[] } | null> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.picks)) return null;

    const picks: Pick[] = await Promise.all(
      parsed.picks.slice(0, 3).map(async (p: RawPick) => {
        const keyword = RECOMMEND_KEYWORDS.includes(p.keyword as (typeof RECOMMEND_KEYWORDS)[number])
          ? (p.keyword as (typeof RECOMMEND_KEYWORDS)[number])
          : "nature";
        const place = p.place ?? p.title ?? "여행지";
        let latitude: number | null = null;
        let longitude: number | null = null;
        try {
          const geo = await geocodeCity(place);
          if (geo) {
            latitude = geo.latitude;
            longitude = geo.longitude;
          }
        } catch {
          // 지오코딩 실패해도 추천 카드는 그대로 보여줌
        }
        return {
          title: p.title ?? "추천 여행지",
          summary: p.summary ?? "",
          keyword,
          image: KEYWORD_PHOTOS[keyword],
          place,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`,
          latitude,
          longitude,
        };
      })
    );
    return { intro: parsed.intro ?? "이런 곳들은 어떠세요?", picks };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { topic, messages } = await request.json();

  if (topic === "recommend") {
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "메시지가 없어요" }, { status: 400 });
    }
    try {
      const raw = await chatComplete([{ role: "system", content: RECOMMEND_SYSTEM }, ...messages]);
      const parsed = await parseRecommendReply(raw);
      if (parsed) {
        return NextResponse.json({ reply: parsed.intro, picks: parsed.picks });
      }
      return NextResponse.json({ reply: raw || "냥...? 다시 한 번 말해줄래?" });
    } catch (error) {
      console.error("소심케어제(추천) 응답 실패", error);
      return NextResponse.json(
        { reply: "지금은 잠깐 낮잠 자는 중이냥... 조금 있다 다시 물어봐줄래?" },
        { status: 200 }
      );
    }
  }

  const systemPrompt = TOPIC_PROMPTS[topic];
  if (!systemPrompt) {
    return NextResponse.json({ error: "알 수 없는 상담 주제예요" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "메시지가 없어요" }, { status: 400 });
  }

  try {
    const reply = await chatComplete([{ role: "system", content: systemPrompt }, ...messages]);
    return NextResponse.json({ reply: reply || "냥...? 다시 한 번 말해줄래?" });
  } catch (error) {
    console.error("소심케어제 응답 실패", error);
    return NextResponse.json(
      { reply: "지금은 잠깐 낮잠 자는 중이냥... 조금 있다 다시 물어봐줄래?" },
      { status: 200 }
    );
  }
}
