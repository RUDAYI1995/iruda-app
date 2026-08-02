"use client";

import { useEffect, useState } from "react";
import { HOME_CAROUSEL_IMAGES } from "@/lib/homeCarouselImages";
import { HOME_CAROUSEL_IMAGES_2 } from "@/lib/homeCarouselImages2";
import { CarouselBox } from "@/components/CarouselBox";
import { TravelSpotPanel } from "@/components/TravelSpotPanel";
import { RudaAlliancePanel } from "@/components/RudaAlliancePanel";
import { DaeguDealsPanel } from "@/components/DaeguDealsPanel";
import { MoodChargePanel } from "@/components/MoodChargePanel";
import { ElectionWatchPanel } from "@/components/ElectionWatchPanel";
import { LGBT_TRAVEL_SPOTS } from "@/lib/lgbtTravelSpots";
import { FAMILY_TRAVEL_SPOTS } from "@/lib/familyTravelSpots";
import { COOL_SUMMER_SPOTS } from "@/lib/coolSummerSpots";
import { WATER_FESTIVAL_SPOTS } from "@/lib/waterFestivalSpots";
import { INFO_SECURITY_TOUR_SPOTS } from "@/lib/infoSecurityTourSpots";
import { SECURITY_EXPERIENCE_SPOTS } from "@/lib/securityExperienceSpots";

type Box = { left: number; top: number; width: number; height: number } | null;

type PanelKey =
  | "lgbt"
  | "family"
  | "cool"
  | "alliance"
  | "daegu"
  | "mood"
  | "election"
  | "water"
  | "infosec"
  | "security";

// 홈 화면 "루다월드" 로고 바로 밑, 그리스 산토리니 배너 바로 왼쪽까지의 자리를 정확히 계산해서
// 절대 위치로 띄움 — flex 흐름에 얹으면 다른 요소(마이페이지 네비 등)를 밀어내기 때문에
// 일부러 흐름 밖(absolute)에 둠. 세로 길이는 소심한 배경화면(히어로 섹션) 바로 위까지 늘림.
export function HomeHeroCarousel() {
  const [box, setBox] = useState<Box>(null);
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null);

  useEffect(() => {
    function measure() {
      const logo = document.getElementById("hero-logo-anchor");
      const promo = document.getElementById("hero-promo-first");
      const heroSection = document.getElementById("home-hero-section");
      const container = logo?.offsetParent as HTMLElement | null;
      if (!logo || !promo || !heroSection || !container) return;

      const containerRect = container.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const promoRect = promo.getBoundingClientRect();
      const heroRect = heroSection.getBoundingClientRect();

      setBox({
        left: logoRect.left - containerRect.left,
        top: promoRect.top - containerRect.top,
        width: promoRect.left - logoRect.left,
        height: heroRect.top - promoRect.top,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 300); // 폰트/이미지 로딩 후 위치가 바뀔 수 있어 한 번 더 재계산
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  if (!box || box.width < 40) return null;

  const gap = 8;
  const slotWidth = (box.width - gap) / 2;

  return (
    <>
      <div
        className="absolute hidden md:block"
        style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
      >
        <div className="flex h-full gap-2">
          <CarouselBox
            slides={HOME_CAROUSEL_IMAGES}
            width={slotWidth}
            onOpenPanel={(key) => setOpenPanel(key as PanelKey)}
          />
          <CarouselBox
            slides={HOME_CAROUSEL_IMAGES_2}
            width={slotWidth}
            onOpenPanel={(key) => setOpenPanel(key as PanelKey)}
          />
        </div>
      </div>

      {openPanel === "lgbt" && (
        <TravelSpotPanel
          eyebrow="🏳️‍🌈 LGBT와 친해지기"
          title="성소수자 친화 여행지"
          spots={LGBT_TRAVEL_SPOTS}
          accentClass="text-purple-500"
          closeButtonClass="text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-950/40"
          onClose={() => setOpenPanel(null)}
        />
      )}
      {openPanel === "family" && (
        <TravelSpotPanel
          eyebrow="👨‍👩‍👧 아이와 즐거운 안심여행"
          title="부모와 아이가 함께하기 좋은 곳"
          spots={FAMILY_TRAVEL_SPOTS}
          accentClass="text-pink-500"
          closeButtonClass="text-pink-500 hover:bg-pink-100 dark:hover:bg-pink-950/40"
          onClose={() => setOpenPanel(null)}
        />
      )}
      {openPanel === "cool" && (
        <TravelSpotPanel
          eyebrow="🧊 더위 뻥! 시원한 여행"
          title="계곡·바다 등 시원한 곳"
          spots={COOL_SUMMER_SPOTS}
          accentClass="text-sky-500"
          closeButtonClass="text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-950/40"
          onClose={() => setOpenPanel(null)}
        />
      )}
      {openPanel === "alliance" && <RudaAlliancePanel onClose={() => setOpenPanel(null)} />}
      {openPanel === "daegu" && <DaeguDealsPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === "mood" && <MoodChargePanel onClose={() => setOpenPanel(null)} />}
      {openPanel === "election" && <ElectionWatchPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === "water" && (
        <TravelSpotPanel
          eyebrow="🔫 대구 물총 페스티벌"
          title="현장 소식 모아보기"
          spots={WATER_FESTIVAL_SPOTS}
          accentClass="text-blue-500"
          closeButtonClass="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/40"
          onClose={() => setOpenPanel(null)}
        />
      )}
      {openPanel === "infosec" && (
        <TravelSpotPanel
          eyebrow="🔒 대구 정보보안 관광"
          title="안전 테마 여행 프로그램"
          spots={INFO_SECURITY_TOUR_SPOTS}
          accentClass="text-indigo-500"
          closeButtonClass="text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-950/40"
          onClose={() => setOpenPanel(null)}
        />
      )}
      {openPanel === "security" && (
        <TravelSpotPanel
          eyebrow="🛡️ 대구 안보 체험 축제"
          title="블루팀 vs 레드팀 체험 프로그램"
          spots={SECURITY_EXPERIENCE_SPOTS}
          accentClass="text-red-500"
          closeButtonClass="text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40"
          onClose={() => setOpenPanel(null)}
        />
      )}
    </>
  );
}
