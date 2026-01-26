import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      coupleId: number | null;
      avatar?: string; // 头像 URL（可选，未来功能）
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    coupleId?: number | null;
    avatar?: string; // 头像 URL（可选，未来功能）
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    coupleId?: number | null;
    avatar?: string; // 头像 URL（可选，未来功能）
  }
}
