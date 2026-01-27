import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyInviteCode } from '@/lib/supabase';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Invite Code',
      credentials: {
        inviteCode: { 
          label: '邀请码', 
          type: 'text',
          placeholder: '请输入你的专属邀请码'
        },
      },
      async authorize(credentials) {
        if (!credentials?.inviteCode) {
          return null;
        }

        const inviteCode = credentials.inviteCode as string;
        
        // 查询 Supabase members 表
        const member = await verifyInviteCode(inviteCode);
        
        if (!member) {
          return null;
        }

        // 返回用户信息，存入 Session
        return {
          id: member.id,
          name: member.name,
          coupleId: member.couple_id,
          avatar: member.avatar || undefined, // 头像 URL
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 首次登录时，将用户信息存入 token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.coupleId = (user as any).coupleId;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      // 将 token 中的信息传递到 session
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.coupleId = token.coupleId as number | null;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  secret: process.env.NEXTAUTH_SECRET,
});
