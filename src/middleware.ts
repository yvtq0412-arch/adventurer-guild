import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Middleware でのルート保護
 *
 * Firebase Auth はEdge Runtimeで動かないため、
 * Firebase がセットするセッションCookie "__session" の存在だけで簡易チェックする。
 * 本格的な検証はクライアント側の useAuth / (dashboard)/layout.tsx が担う。
 */

// ログインが必要なパスのプレフィックス
const PROTECTED_PREFIXES = [
  '/quests',
  '/my-quests',
  '/my-adventures',
  '/wallet',
  '/invoices',
  '/profile',
  '/onboarding',
];

// ログイン済みのユーザーがアクセスしたらリダイレクトするパス
const AUTH_ONLY_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Firebase Auth が発行するセッションCookieを確認
  // ※ ブラウザ側でFirebase SDKがセットする '__session' または 'firebase-auth-token' を使う
  // ただしFirebase JS SDKはindexedDBを使うためCookieは常に存在するわけではない
  // → Cookieがなくてもクライアント側レイアウトで再チェックするので、
  //   ここではlocalStorage相当の情報が取れないためCookieヒューリスティックのみ行う

  const isAuthenticated = hasAuthCookie(request);

  // ログイン済みユーザーがログイン/登録ページにアクセス → /quests にリダイレクト
  if (isAuthenticated && AUTH_ONLY_PATHS.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL('/quests', request.url));
  }

  return NextResponse.next();
}

function hasAuthCookie(request: NextRequest): boolean {
  // Firebase JS SDK はデフォルトではCookieを使わない（IndexedDB）
  // next-firebase-auth 等を使っていない場合はCookieが存在しないため
  // この関数は常にfalseを返し、ミドルウェアレベルの保護は行わない。
  // 実際の保護は (dashboard)/layout.tsx (クライアントコンポーネント) で行う。
  const cookieNames = ['__session', 'firebase:authUser'];
  return cookieNames.some((name) => request.cookies.has(name));
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
