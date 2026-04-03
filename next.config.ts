import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 日本語ディレクトリ名によるTurbopackバグを回避
  // https://github.com/vercel/next.js/issues - マルチバイト文字のパス問題
  experimental: {},
};

export default nextConfig;
