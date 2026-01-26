import { auth } from '@/auth';

/**
 * 服务端获取当前会话
 */
export async function getServerSession() {
  return await auth();
}

/**
 * 服务端获取当前用户
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * 服务端检查是否已登录
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session;
}
