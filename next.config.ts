import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 日本語ディレクトリ名によるTurbopackバグを回避 → Webpack使用
  turbopack: undefined,
};

export default nextConfig;
