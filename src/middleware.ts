import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 公开路由：登录页和 API 路由
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/');

  // 如果未登录且访问受保护路由，重定向到登录页
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录且访问登录页，重定向到首页
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - _next/static (静态文件)
     * - _next/image (图像优化文件)
     * - favicon.ico (网站图标)
     * - public 文件夹下的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|mp3|txt|md)$).*)',
  ],
};
