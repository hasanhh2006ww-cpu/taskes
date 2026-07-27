import type { NextAuthConfig } from 'next-auth';

const publicRoutes = ['/login', '/register'];

export const authConfig = {
  providers: [],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPublic = publicRoutes.some((r) => nextUrl.pathname === r);

      if (isLoggedIn && isOnPublic) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (!isLoggedIn && !isOnPublic) {
        return false;
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image as string | null;
        token.isDemo = user.isDemo ?? false;
      }
      if (trigger === 'update' && session?.user) {
        if (session.user.name !== undefined) token.name = session.user.name;
        if (session.user.email !== undefined) token.email = session.user.email;
        if (session.user.image !== undefined) token.picture = session.user.image as string | null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.name != null) session.user.name = token.name;
        if (token.email != null) session.user.email = token.email;
        if (token.picture != null) session.user.image = token.picture;
        session.user.isDemo = token.isDemo ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;