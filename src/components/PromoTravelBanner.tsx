import Link from "next/link";

type PromoTravelBannerProps = {
  image?: string;
  alt?: string;
  title?: string;
};

export function PromoTravelBanner({
  image = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
  alt = "산토리니 여행특가",
  title = "그리스 산토리니 · 지금 예약하면 특가",
}: PromoTravelBannerProps) {
  return (
    <Link
      href="/coming-soon/courses"
      className="group relative block h-full w-full overflow-hidden rounded-xl shadow-sm"
    >
      <img
        src={image}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2">
        <span className="w-fit rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
          여행특가
        </span>
        <span className="text-xs font-semibold leading-tight text-white drop-shadow">
          {title}
        </span>
      </div>
    </Link>
  );
}
