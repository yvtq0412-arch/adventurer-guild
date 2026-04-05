import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 日本語ディレクトリ名によるTurbopackバグを回避 → Webpack使用
  turbopack: undefined,
  images: {
    remotePatterns: [
      {
        // Google アカウントのアバター画像
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Firebase Storage のアバター画像
        protocol: 'https',
        hostname: '*.firebasestorage.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
