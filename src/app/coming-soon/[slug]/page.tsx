import Link from "next/link";
import { notFound } from "next/navigation";

const PAGES: Record<string, { title: string; desc: string }> = {
  guides: {
    title: "데이가이드",
    desc: "해외여행 중 언어가 걱정된다면, 성향과 언어가 맞는 가이드를 매칭해드리는 기능이에요.",
  },
  messages: {
    title: "1:1 개인톡",
    desc: "매칭된 정모원·가이드, 또는 게시글 작성자와 1:1로 대화하는 기능이에요.",
  },
  community: {
    title: "커뮤니티 게시판",
    desc: "자유롭게 글을 올리고 댓글을 달거나, 게시자에게 대화를 신청하는 기능이에요.",
  },
  courses: {
    title: "여행코스짜기",
    desc: "계획적인(J) 성향 그룹이 검증된 출처의 맛집 후보를 등록하고 투표로 코스를 확정하는 기능이에요.",
  },
  rentals: {
    title: "이동수단 대여",
    desc: "여행지 현지에서 자전거·스쿠터·차량 등 이동수단을 대여받는 기능이에요.",
  },
  "departure-alerts": {
    title: "이동 출발 알림",
    desc: "다음 장소로 이동해야 할 시점을 카운트다운으로 미리 알려주는 기능이에요.",
  },
  "safety-alerts": {
    title: "위치 기반 안전 알림",
    desc: "현재 위치 근처에 위험 사건이 있으면 알려주는 안전 알림 기능이에요.",
  },
  "remote-safety": {
    title: "원격 여행 안전 서비스",
    desc: "담당 가이드가 책임지고 여행자의 안전을 원격으로 모니터링·지원하는 서비스예요.",
  },
};

export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
        준비 중인 기능이에요
      </span>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {page.title}
      </h1>
      <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {page.desc}
      </p>
      <Link
        href="/home"
        className="mt-4 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        홈페이지로 돌아가기
      </Link>
    </div>
  );
}
