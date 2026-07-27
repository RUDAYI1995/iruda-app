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
import { LudapiaButton } from "@/components/LudapiaButton";
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
        title: "해외 실시간 교통정보",
        desc: "Google Maps Routes API(대중교통 경로)로 해외에서도 다음 교통편까지 남은 시간을 확인해요.",
        status: "예정",
        href: "/coming-soon/transit-overseas",
      },
      {
        title: "국내+해외 통합 교통정보",
        desc: "현재 위치가 국내인지 해외인지 자동으로 구분해, 같은 화면에서 알맞은 실시간 교통정보를 이어서 보여줘요.",
        status: "예정",
        href: "/coming-soon/transit-combined",
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
        desc: "여행 중인 팀끼리 매칭돼 OX퀴즈·방문인증·거리 달리기·투표 등 낮 미션 5종과 밤 미션으로 대결해요.",
        status: "예정",
        href: "/coming-soon/games",
      },
      {
        title: "레벨성장",
        desc: "여행지를 방문할 때마다 경험치를 얻어요. 해외는 경험치를 더 많이, 국내는 적게 획득해요.",
        status: "예정",
        href: "/coming-soon/leveling",
      },
      {
        title: "이벤트",
        desc: "마일리지 혜택 / 올해의 모험왕 / 여행 상상력 풍부상 / 안전체크단, 4가지 이벤트를 만나보세요.",
        status: "예정",
        href: "/coming-soon/events",
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

const SEARCH_ITEMS = FEATURE_GROUPS.flatMap((g) =>
  g.items.map((f) => ({ title: f.title, href: f.href }))
);
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
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8">
        <div className="flex flex-wrap items-start gap-4">
          <LudaWorldLogo />
          <div className="flex flex-col gap-1 pt-1.5">
            <div className="w-[180px]">
              <SiteSearchBar items={SEARCH_ITEMS} />
            </div>
            <PopularSearchTicker />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                <TravelGuidebookButton />
                <AnimalCompanionButton />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <TodayMoodButton />
                  <DestinationWeatherButton />
                  <ShyCareButton />
                  <LudariaButton />
                </div>
                <div className="flex gap-2">
                  <PetPettingButton />
                  <NaEnomButton />
                  <OnlineTravelButton />
                  <LudapiaButton />
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
          <nav className="ml-auto flex items-center gap-4 pt-1.5 text-sm font-medium">
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
                    await signOut({ redirectTo: "/" });
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

      <section className="relative flex flex-col items-center gap-6 overflow-hidden px-6 py-32 text-center sm:py-44">
        <HeroLandscape condition={heroCondition} />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/0 via-white/10 to-zinc-50 dark:to-black" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="mb-2 flex flex-col items-center">
            {/* 구름처럼 뭉글뭉글한 하늘색 말풍선 */}
            <div className="relative mb-4">
              <div className="relative rounded-[2rem] bg-sky-100 px-5 py-3 text-center text-sm font-bold leading-snug text-sky-950 shadow-xl">
                당신을 위해 만들었어
                <br />
                좋은 말 할 때 일루 와
              </div>
              {/* 뭉게뭉게 구름 테두리 장식 */}
              <div className="absolute -left-2 top-1 h-6 w-6 rounded-full bg-sky-100 shadow-md" />
              <div className="absolute -left-4 top-4 h-5 w-5 rounded-full bg-sky-100 shadow-md" />
              <div className="absolute -right-2 top-0 h-7 w-7 rounded-full bg-sky-100 shadow-md" />
              <div className="absolute -right-3 bottom-1 h-5 w-5 rounded-full bg-sky-100 shadow-md" />
              <div className="absolute -bottom-2 left-6 h-4 w-4 rounded-full bg-sky-100 shadow-md" />
              {/* 구름 꼬리 (말풍선 -> 캐릭터) */}
              <div className="absolute left-1/2 top-full mt-1 h-3 w-3 -translate-x-1/2 rounded-full bg-sky-100 shadow-md" />
              <div className="absolute left-1/2 top-full mt-5 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-100 shadow-md" />
            </div>

            {/* 버럭 화내며 할퀴려는 고양이 */}
            <div className="relative">
              {/* 할퀸 자국 */}
              <div className="absolute -right-3 top-2 h-16 w-16 rotate-12 opacity-80">
                <div className="absolute left-2 top-0 h-full w-0.5 -rotate-12 bg-white/90" />
                <div className="absolute left-5 top-0 h-full w-0.5 -rotate-12 bg-white/90" />
                <div className="absolute left-8 top-0 h-full w-0.5 -rotate-12 bg-white/90" />
              </div>
              <div className="animate-angry-shake relative flex h-32 w-32 items-center justify-center rounded-full bg-white text-7xl shadow-2xl sm:h-36 sm:w-36">
                😾
                <span className="absolute -right-2 -top-2 text-3xl">💢</span>
                <span className="absolute -left-3 bottom-0 text-3xl">🐾</span>
              </div>
            </div>
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)] sm:text-5xl">
            <span className="relative inline-block">
              소심한
              <svg
                className="pointer-events-none absolute -inset-x-5 -inset-y-4 select-none"
                viewBox="0 0 130 60"
                preserveAspectRatio="none"
              >
                <path
                  d="M9,30 C7,13 35,4 65,5 C97,6 122,13 120,30 C123,46 92,55 63,54 C33,53 6,47 10,31"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            사람들을 위한
            <br />
            수줍은 여행 플랫폼
          </h1>
          <p className="max-w-xl rounded-2xl bg-white/40 px-4 py-2 text-lg leading-8 text-zinc-800 backdrop-blur-sm">
            낯선 사람과의 만남이 부담스러워도 괜찮아요. 성향이 맞는 소규모
            그룹, 언어가 통하는 데이가이드, 그리고 책임지고 안전을 지켜주는
            원격 여행 안전 서비스까지 — 여행은 훨씬 편안해져요.
          </p>
          <div className="flex gap-4">
            <Link
              href={session?.user ? "/dashboard" : "/signup"}
              className="rounded-full bg-white px-6 py-3 text-base font-medium text-sky-900 transition-colors hover:bg-sky-50"
            >
              지금 시작하기
            </Link>
            <Link
              href="/guides"
              className="rounded-full border border-white/60 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              가이드 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-8 px-6 py-20 lg:flex-row">
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
    </div>
  );
}
