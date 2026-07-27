import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const isValid = await compare(password, user.password);
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.avatar, isDemo: user.isDemo };
      },
    }),
  ],
});
