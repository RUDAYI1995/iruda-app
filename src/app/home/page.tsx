import Link from "next/link";
import { auth, signOut } from "@/auth";
import { SiteSearchBar } from "@/components/SiteSearchBar";
import { PopularSearchTicker } from "@/components/PopularSearchTicker";
import { HourglassCategoryPicker } from "@/components/HourglassCategoryPicker";
import { AdventureBanner } from "@/components/AdventureBanner";
import { HeroLandscape } from "@/components/HeroLandscape";
import {
  geocodeCity,
  getCurrentWeather,
  getSimpleCondition,
  type SimpleCondition,
} from "@/lib/weather/openMeteo";
import { PinkHeartBurst } from "@/components/PinkHeartBurst";
import { CheerButton } from "@/components/CheerButton";
import { VisitTracker } from "@/components/VisitTracker";
import { ScheduleBox } from "@/components/ScheduleBox";
import { AttractionExplorer } from "@/components/AttractionExplorer";
import { TravelGuidebookButton } from "@/components/TravelGuidebookButton";
import { TodayMoodButton } from "@/components/TodayMoodButton";
import { DestinationWeatherButton } from "@/components/DestinationWeatherButton";
import { ShyCareButton } from "@/components/ShyCareButton";
import { AnimalCompanionButton } from "@/components/AnimalCompanionButton";
import { PetPettingButton } from "@/components/PetPettingButton";
import { NaEnomButton } from "@/components/NaEnomButton";
import { OnlineTravelButton } from "@/components/OnlineTravelButton";
import { LudariaButton } from "@/components/LudariaButton";
import { AssaWorldButton } from "@/components/AssaWorldButton";
import { AssaDungeonButton } from "@/components/AssaDungeonButton";
import { LudapiaButton } from "@/components/LudapiaButton";
import { RudaVoteButton } from "@/components/RudaVoteButton";
import { LudaWorldLogo } from "@/components/LudaWorldLogo";
import { PromoTravelBanner } from "@/components/PromoTravelBanner";
import {
  CherryBlossomBg,
  CallCenterBg,
  TravelBurstBg,
  SafetyBridgeBg,
  LevelUpBg,
} from "@/components/CategoryBackgrounds";
import { prisma } from "@/lib/prisma";

const CATEGORY_BACKGROUNDS: Record<string, () => React.ReactNode> = {
  matching: () => <CherryBlossomBg />,
  inquiry: () => <CallCenterBg />,
  prep: () => <TravelBurstBg />,
  safety: () => <SafetyBridgeBg />,
  fun: () => <LevelUpBg />,
};

type Feature = {
  title: string;
  desc: string;
  status: "구현됨" | "예정";
  href: string;
  featured?: boolean;
  preview?: "heart";
};

type Accent = {
  soft: string;
  text: string;
  border: string;
  gradient: string;
  chip: string;
};

const ACCENTS: Record<string, Accent> = {
  matching: {
    soft: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-300",
    border: "border-rose-200 hover:border-rose-400 dark:border-rose-900/50 dark:hover:border-rose-700",
    gradient: "from-rose-400 to-pink-500",
    chip: "bg-rose-500",
  },
  inquiry: {
    soft: "bg-sky-50 dark:bg-sky-950/30",
    text: "text-sky-600 dark:text-sky-300",
    border: "border-sky-200 hover:border-sky-400 dark:border-sky-900/50 dark:hover:border-sky-700",
    gradient: "from-sky-400 to-cyan-500",
    chip: "bg-sky-500",
  },
  prep: {
    soft: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-200 hover:border-amber-400 dark:border-amber-900/50 dark:hover:border-amber-700",
    gradient: "from-amber-400 to-orange-500",
    chip: "bg-amber-500",
  },
  safety: {
    soft: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-300",
    border: "border-emerald-200 hover:border-emerald-400 dark:border-emerald-900/50 dark:hover:border-emerald-700",
    gradient: "from-emerald-400 to-teal-500",
    chip: "bg-emerald-500",
  },
  fun: {
    soft: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-300",
    border: "border-violet-200 hover:border-violet-400 dark:border-violet-900/50 dark:hover:border-violet-700",
    gradient: "from-violet-400 to-purple-500",
    chip: "bg-violet-500",
  },
};

const FEATURE_GROUPS: {
  category: string;
  slug: string;
  emoji: string;
  step: string;
  tagline: string;
  items: Feature[];
}[] = [
  {
    category: "매칭 & 성향",
    slug: "matching",
    emoji: "💘",
    step: "01",
    tagline: "낯가림도 취향이 되는 곳 — 나와 결이 맞는 사람부터 찾아요",
    items: [
      {
        title: "성향 테스트로 시작하기",
        desc: "동조형/스몰톡형/공동생활형/이동동행형 대분류 선택 후, 자체 4축 성향 테스트로 나만의 4글자 코드를 받아요. 혼자 떠나기 망설여졌다면 여기서부터 시작해보세요.",
        status: "구현됨",
        href: "/test/category",
        featured: true,
      },
      {
        title: "정모 매칭",
        desc: "대분류 필터 + 축유사도·관심사·속도·언어 가중치 스코어링으로 3-5인 그룹을 구성해요.",
        status: "구현됨",
        href: "/meetups",
        preview: "heart",
      },
      {
        title: "데이가이드",
        desc: "해외여행 중 언어가 걱정된다면, 성향과 언어가 맞는 가이드를 매칭해드려요.",
        status: "구현됨",
        href: "/guides",
      },
    ],
  },
  {
    category: "문의",
    slug: "inquiry",
    emoji: "💬",
    step: "02",
    tagline: "궁금한 건 참지 말고 — 사람 대 사람으로 편하게 물어봐요",
    items: [
      {
        title: "1:1 문의톡",
        desc: "매칭된 정모원·가이드, 또는 게시글 작성자와 1:1로 편하게 대화해요.",
        status: "구현됨",
        href: "/messages",
      },
      {
        title: "게시판",
        desc: "자유롭게 글을 올리고 댓글을 달거나, 게시자에게 바로 대화를 신청할 수 있어요. 최신글/오래된글 순으로 볼 수 있어요.",
        status: "구현됨",
        href: "/board",
      },
    ],
  },
  {
    category: "여행 준비",
    slug: "prep",
    emoji: "🧳",
    step: "03",
    tagline: "계획은 촘촘하게, 마음은 가볍게 — 다음 걸음까지 미리 알려드려요",
    items: [
      {
        title: "여행코스짜기",
        desc: "계획적인(J) 성향 그룹이 검증된 출처의 맛집 후보를 등록하고, 멤버 투표로 합의된 곳만 코스에 포함해요.",
        status: "예정",
        href: "/coming-soon/courses",
      },
      {
        title: "이동수단 대여",
        desc: "여행지 현지에서 자전거·스쿠터·차량 등 이동수단을 대여받을 수 있어요.",
        status: "예정",
        href: "/coming-soon/rentals",
      },
      {
        title: "이동 출발 알림",
        desc: "다음 장소로 이동해야 할 시점을 카운트다운으로 미리 알려줘요.",
        status: "예정",
        href: "/coming-soon/departure-alerts",
      },
      {
        title: "국내 실시간 교통정보",
        desc: "공공데이터포털 버스도착정보 API로 국내 여행 중 다음 버스까지 남은 시간을 실시간으로 확인해요.",
        status: "구현됨",
        href: "/transit/domestic",
      },
      {
        title: "해외 실시간 교통정보 추천",
        desc: "목적지와 호텔을 알려주면 AI루다가 항공편부터 현지 교통까지 가는 길을 코스로 추천해줘요.",
        status: "구현됨",
        href: "/transit/overseas",
      },
      {
        title: "국내+해외 통합 교통정보",
        desc: "집에서 공항까지, 공항에서 호텔까지 — 국내외 여정을 한 화면에서 이어서 확인해요.",
        status: "구현됨",
        href: "/transit/combined",
      },
    ],
  },
  {
    category: "안전",
    slug: "safety",
    emoji: "🛡️",
    step: "04",
    tagline: "혼자 걷는 길에도 누군가 지켜보고 있어요",
    items: [
      {
        title: "위치 기반 안전 알림",
        desc: "현재 위치 근처에 위험 사건이 있으면 알려주는 안전 알림 시스템이에요.",
        status: "예정",
        href: "/coming-soon/safety-alerts",
      },
      {
        title: "원격 여행 안전 서비스",
        desc: "담당 가이드가 책임지고 여행자의 안전을 원격으로 모니터링·지원해줘요.",
        status: "예정",
        href: "/coming-soon/remote-safety",
      },
    ],
  },
  {
    category: "재미 & 성장",
    slug: "fun",
    emoji: "🎮",
    step: "05",
    tagline: "여행할수록 레벨업 — 소심함도 경험치가 돼요",
    items: [
      {
        title: "실시간 여행게임 대전",
        desc: "OX퀴즈·방문인증·거리 달리기·투표·표정짓기 5가지 미션으로 팀 대결을 해요.",
        status: "구현됨",
        href: "/games",
      },
      {
        title: "레벨성장",
        desc: "여행지를 방문할 때마다 경험치를 얻어요. 해외는 경험치를 더 많이, 국내는 적게 획득해요.",
        status: "구현됨",
        href: "/my-page",
      },
      {
        title: "이벤트",
        desc: "마일리지 혜택 / 올해의 모험왕 / 여행 상상력 풍부상 / 안전체크단, 4가지 이벤트를 만나보세요.",
        status: "예정",
        href: "/events",
      },
    ],
  },
];

function StatusBadge({ status }: { status: Feature["status"] }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        status === "구현됨"
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
          : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
      }`}
    >
      {status}
    </span>
  );
}

const HOME_ONLY_SEARCH_ITEMS = [
  { title: "여행 가이드북", elementId: "feature-guidebook" },
  { title: "동물동행제", elementId: "feature-animal-companion" },
  { title: "오늘 컨디션", elementId: "feature-mood" },
  { title: "여행지 날씨", elementId: "feature-weather" },
  { title: "소심케어제", elementId: "feature-shy-care" },
  { title: "루다리아", elementId: "feature-ludaria" },
  { title: "아싸세상", elementId: "feature-assa-world" },
  { title: "아싸던전", elementId: "feature-assa-dungeon" },
  { title: "쓰담쓰담", elementId: "feature-pet-petting" },
  { title: "네이노옴", elementId: "feature-na-enom" },
  { title: "위대한 모험", elementId: "feature-online-travel" },
];
const SEARCH_ITEMS = [
  ...FEATURE_GROUPS.flatMap((g) => g.items.map((f) => ({ title: f.title, href: f.href }))),
  { title: "루다피아", href: "/ludapia" },
  { title: "루다투표제", href: "/ruda-vote" },
  ...HOME_ONLY_SEARCH_ITEMS,
];
const HOURGLASS_CATEGORIES = FEATURE_GROUPS.map((g) => ({
  slug: g.slug,
  label: g.category,
  emoji: g.emoji,
}));

async function getDaeguCondition(): Promise<SimpleCondition> {
  try {
    const place = await geocodeCity("Daegu");
    if (!place) return "clear";
    const weather = await getCurrentWeather(place.latitude, place.longitude);
    return getSimpleCondition(weather.weatherCode);
  } catch {
    return "clear";
  }
}

export default async function Home() {
  const session = await auth();
  const heroCondition = await getDaeguCondition();
  const posts = await prisma.post.findMany({ include: { author: true, comments: true } });
  const newestPosts = [...posts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const oldestPosts = [...posts]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-x-auto px-6 pb-0 pt-8">
        <div className="flex flex-wrap items-start gap-4">
          <LudaWorldLogo />
          <div className="ml-8 flex flex-col gap-1 pt-1.5">
            <div className="w-[180px]">
              <SiteSearchBar items={SEARCH_ITEMS} />
            </div>
            <PopularSearchTicker />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                <div id="feature-guidebook"><TravelGuidebookButton /></div>
                <div id="feature-animal-companion"><AnimalCompanionButton /></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div id="feature-mood"><TodayMoodButton /></div>
                  <div id="feature-weather"><DestinationWeatherButton /></div>
                  <div id="feature-shy-care"><ShyCareButton /></div>
                  <div id="feature-ludaria"><LudariaButton /></div>
                  <div id="feature-assa-world"><AssaWorldButton /></div>
                  <div id="feature-assa-dungeon"><AssaDungeonButton /></div>
                </div>
                <div className="flex gap-2">
                  <div id="feature-pet-petting"><PetPettingButton /></div>
                  <div id="feature-na-enom"><NaEnomButton /></div>
                  <div id="feature-online-travel"><OnlineTravelButton /></div>
                  <div id="feature-ludapia"><LudapiaButton /></div>
                  <div id="feature-ruda-vote"><RudaVoteButton /></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-[64px] w-[140px]">
                <PromoTravelBanner />
              </div>
              <div className="h-[64px] w-[140px]">
                <PromoTravelBanner
                  image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"
                  alt="스위스 융프라우 여행특가"
                  title="스위스 융프라우 · 지금 예약하면 특가"
                />
              </div>
              <div className="h-[64px] w-[140px]">
                <PromoTravelBanner
                  image="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80"
                  alt="일본 교토 여행특가"
                  title="일본 교토 · 지금 예약하면 특가"
                />
              </div>
              <div className="h-[64px] w-[140px]">
                <PromoTravelBanner
                  image="https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=800&q=80"
                  alt="인도네시아 발리 여행특가"
                  title="인도네시아 발리 · 지금 예약하면 특가"
                />
              </div>
              <div className="h-[64px] w-[140px]">
                <PromoTravelBanner
                  image="https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80"
                  alt="뉴질랜드 여행특가"
                  title="뉴질랜드 · 지금 예약하면 특가"
                />
              </div>
            </div>
          </div>
          <nav className="ml-auto flex shrink-0 items-center gap-4 whitespace-nowrap pt-1.5 text-sm font-medium">
            <Link
              href="/my-page"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              마이페이지
            </Link>
            <Link
              href="/board"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              게시판
            </Link>
            <Link
              href="/meetups"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              정모
            </Link>
            <Link
              href="/group-chats"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              단체채팅
            </Link>
            <Link
              href="/matching-test"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              매칭 테스트
            </Link>
            {session?.user ? (
              <>
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  환영해요, {session.user.name}님
                  {(session.user as { isOperator?: boolean }).isOperator && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      운영자 공동계정
                    </span>
                  )}
                </span>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  대시보드
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/home" });
                  }}
                >
                  <button className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="ml-1 rounded-full bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  가입하기
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative w-full overflow-hidden">
        <HeroLandscape condition={heroCondition} />
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-8 px-6 pb-20 pt-0 lg:flex-row">
        <AdventureBanner />

        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl py-10"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 100%, #fde68a 0%, #fbbf24 35%, #d97706 70%, #92400e 100%)",
          }}
        >
          {/* 사막 모래언덕 결 무늬 */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-radial-gradient(ellipse at 30% 110%, rgba(255,255,255,0.25) 0px, transparent 3px, transparent 14px)," +
                "repeating-radial-gradient(ellipse at 75% 120%, rgba(146,64,14,0.3) 0px, transparent 3px, transparent 18px)",
            }}
          />
          <span className="absolute bottom-6 left-8 text-3xl drop-shadow">🌵</span>
          <span className="absolute bottom-10 right-10 text-3xl drop-shadow">🐫</span>
          <span className="absolute right-6 top-8 text-2xl drop-shadow">☀️</span>

          <div className="relative">
            <HourglassCategoryPicker categories={HOURGLASS_CATEGORIES} />
          </div>
        </div>

        <div className="flex flex-1" style={{ minHeight: 460 }}>
          <AttractionExplorer compact fillHeight />
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-8 px-6 pb-20 lg:flex-row">
        <ScheduleBox />

        <div className="flex-1 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">자유게시판</h2>
            <Link
              href="/board/new"
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              글쓰기
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                최신글
              </h3>
              <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
                {newestPosts.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-zinc-400">아직 글이 없어요.</p>
                ) : (
                  newestPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/board/${p.id}`}
                      className="flex items-center gap-2 px-1 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <span className="line-clamp-1 min-w-0 flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                        {p.title}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-400">{p.author.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                오래된글
              </h3>
              <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
                {oldestPosts.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-zinc-400">아직 글이 없어요.</p>
                ) : (
                  oldestPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/board/${p.id}`}
                      className="flex items-center gap-2 px-1 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <span className="line-clamp-1 min-w-0 flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                        {p.title}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-400">{p.author.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {FEATURE_GROUPS.map((group, groupIndex) => {
        const accent = ACCENTS[group.slug];
        return (
          <section
            key={group.category}
            id={`category-${group.slug}`}
            className={`relative overflow-hidden py-20 scroll-mt-6 ${
              groupIndex % 2 === 1 ? "bg-zinc-50 dark:bg-zinc-950/40" : "bg-white dark:bg-black"
            }`}
          >
            <div className="relative mx-auto w-full max-w-6xl px-6">
              <div
                className={`relative mb-10 flex min-h-[120px] items-center gap-4 overflow-hidden rounded-2xl px-4 ${accent.soft}`}
              >
                {CATEGORY_BACKGROUNDS[group.slug]?.()}
                <span
                  className={`relative bg-gradient-to-br ${accent.gradient} z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md`}
                >
                  {group.emoji}
                </span>
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold tracking-widest ${accent.text}`}>
                      STEP {group.step}
                    </span>
                    <span className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {group.category}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{group.tagline}</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((f) => (
                  <Link
                    key={f.title}
                    href={f.href}
                    className={`group relative flex flex-col gap-2 overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-950 ${accent.border} ${
                      f.featured
                        ? `sm:col-span-2 lg:col-span-3 ${accent.soft}`
                        : ""
                    }`}
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${accent.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`font-semibold text-zinc-900 dark:text-zinc-50 ${
                          f.featured ? "text-xl" : "text-base"
                        }`}
                      >
                        {f.title}
                      </h3>
                      <StatusBadge status={f.status} />
                    </div>
                    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{f.desc}</p>
                    {f.preview === "heart" && <PinkHeartBurst />}
                    {f.featured && (
                      <span
                        className={`mt-1 inline-flex w-fit items-center gap-1 text-sm font-semibold ${accent.text}`}
                      >
                        성향 테스트 시작하기 →
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <footer className="mx-auto w-full max-w-6xl px-6 py-12 text-center text-sm text-zinc-400 dark:text-zinc-600">
        © 2026 루다월드. All rights reserved.
      </footer>

      <CheerButton />
      <VisitTracker />
    </div>
  );
}
