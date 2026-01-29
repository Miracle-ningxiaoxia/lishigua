import { handlers } from '@/auth';

// 使用 Edge Runtime 以提升响应速度
export const runtime = 'edge';

export const { GET, POST } = handlers;
