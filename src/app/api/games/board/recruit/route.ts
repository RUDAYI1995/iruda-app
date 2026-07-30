import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatComplete } from "@/lib/upstage/client";
import { photosForTile } from "@/lib/tilePhotos";

const POST_COUNT = 4;

function fallbackPosts(tileLabel: string) {
  return Array.from({ length: POST_COUNT }, (_, i) => ({
    title: `${tileLabel}에서 같이 놀 사람 구해요! (${i + 1})`,
    body: `${tileLabel}랑 잘 어울리는 소소한 정모예요. 부담 없이 편하게 놀러오세요!`,
    location: tileLabel,
  }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { tileLabel } = await request.json();
  if (typeof tileLabel !== "string" || !tileLabel.trim()) {
    return NextResponse.json({ error: "tileLabel이 필요해요" }, { status: 400 });
  }

  let posts = fallbackPosts(tileLabel);

  try {
    const raw = await chatComplete([
      {
        role: "system",
        content:
          "너는 소심한 사람들을 위한 여행 매칭 앱 '이루다'의 정모 모집글을 쓰는 AI야. " +
          "주어진 '장소 테마'와 반드시 실제로 어울리는 활동/장소여야 해 (예: 테마가 '고양이 카페'면 카페나 고양이 관련 장소, '작은 공방'이면 공방/공예 관련, '고요한 산책길'이면 등산·산책 관련 등 — 테마와 무관한 내용은 절대 안 됨). " +
          `서로 다른 모집글 ${POST_COUNT}개를 만들어. 같은 테마 안에서도 시간대·분위기·모인 사람 성격 등을 다양하게 해서 겹치지 않게 써. ` +
          `반드시 아래 JSON 형식으로만 답해, 다른 텍스트 없이: {"posts":[{"title":"...","body":"...","location":"..."}, ... 총 ${POST_COUNT}개]}`,
      },
      {
        role: "user",
        content: `장소 테마: ${tileLabel}. 이 테마에 딱 맞는 소규모 정모 모집글 ${POST_COUNT}개를 써줘.`,
      },
    ]);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.posts) && parsed.posts.length > 0) {
        posts = Array.from({ length: POST_COUNT }, (_, i) => {
          const p = parsed.posts[i % parsed.posts.length];
          return {
            title: p.title ?? fallbackPosts(tileLabel)[i].title,
            body: p.body ?? fallbackPosts(tileLabel)[i].body,
            location: p.location ?? tileLabel,
          };
        });
      }
    }
  } catch {
    // AI 실패 시 폴백 문구 그대로 사용
  }

  const photos = photosForTile(tileLabel, POST_COUNT);

  const created = await Promise.all(
    posts.map(async (post, i) => {
      const activity = await prisma.activity.create({
        data: { name: post.title, description: post.body },
      });
      const scheduledAt = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000);
      const meetup = await prisma.meetup.create({
        data: {
          activityId: activity.id,
          location: post.location,
          scheduledAt,
          minSize: 3,
          maxSize: 5,
        },
      });
      return { meetupId: meetup.id, title: post.title, body: post.body, location: post.location, photoUrl: photos[i] };
    })
  );

  return NextResponse.json({ posts: created });
}
