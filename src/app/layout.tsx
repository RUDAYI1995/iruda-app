import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { FontToggle } from "@/components/FontToggle";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import { RouteFontScale } from "@/components/RouteFontScale";
import { AiRudaWidget } from "@/components/AiRudaWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "이루다 — 소심한 사람들을 위한 매칭 여행",
  description: "성향 기반 소규모 정모 매칭과 데이가이드로 떠나는, 부담 없는 여행 플랫폼 이루다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="font-pref-init" strategy="beforeInteractive">
          {"try{if(localStorage.getItem('iruda-font-pref')==='original'){document.documentElement.dataset.font='original';}}catch(e){}"}
        </Script>
        <Providers>{children}</Providers>
        <FontToggle />
        <BackgroundMusic />
        <RouteFontScale />
        <AiRudaWidget />
      </body>
    </html>
  );
}
