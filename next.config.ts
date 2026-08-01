import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // sharp는 네이티브 바이너리라 Vercel 서버리스 번들링 시 자동으로 안 딸려와서
  // 콜드스타트 때 종종 500이 나던 문제 — 이렇게 명시해야 Next가 바이너리를 함께 포함시킴
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
