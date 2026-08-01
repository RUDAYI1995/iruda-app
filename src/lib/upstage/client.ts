const BASE_URL = "https://api.upstage.ai/v1";

function requireApiKey(): string {
  const key = process.env.UPSTAGE_API_KEY;
  if (!key) {
    throw new Error(
      "UPSTAGE_API_KEY가 설정되지 않았어요. console.upstage.ai에서 무료 API 키를 발급받아 .env에 넣어주세요."
    );
  }
  return key;
}

export async function chatComplete(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiKey = requireApiKey();

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "solar-pro2",
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstage Chat API 오류 (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

type VisionContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

// 이미지(표정 사진 등)를 함께 보내는 멀티모달 채팅 시도용.
// 주의: 실제로 확인해보니 solar-pro2는 이미지 입력을 거부함("Image input is not allowed for this model").
// 호출부는 반드시 try/catch로 감싸서 실패 시 사람이 판단하는 방식(투표 등)으로 대체할 것.
export async function chatCompleteVision(
  messages: { role: "system" | "user" | "assistant"; content: string | VisionContentPart[] }[]
): Promise<string> {
  const apiKey = requireApiKey();

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "solar-pro2",
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstage Vision API 오류 (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function embedText(input: string | string[]): Promise<number[][]> {
  const apiKey = requireApiKey();

  const res = await fetch(`${BASE_URL}/solar/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "solar-embedding-1-large-query",
      input: Array.isArray(input) ? input : [input],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstage Embeddings API 오류 (${res.status}): ${text}`);
  }

  const data = await res.json();
  return (data?.data ?? []).map((d: { embedding: number[] }) => d.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
