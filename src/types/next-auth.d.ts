import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      isDemo: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    isDemo?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    isDemo?: boolean;
  }
}
