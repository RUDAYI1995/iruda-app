import type { NextAuthConfig } from "next-auth";

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const authConfig = {
  session: { strategy: "jwt", maxAge: YEAR_IN_SECONDS },
  jwt: { maxAge: YEAR_IN_SECONDS },
  cookies: {
    sessionToken: {
      options: {
        maxAge: YEAR_IN_SECONDS,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isOperator = (user as { isOperator?: boolean }).isOperator ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { isOperator?: boolean }).isOperator = token.isOperator as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
