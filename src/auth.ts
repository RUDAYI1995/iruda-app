import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// 대회 시연/QA용 "테스트버전 로그인" 전용 계정 — 실제 이메일/비밀번호 없이 바로 체험할 수 있게 함.
const TEST_LOGIN_EMAIL = "test@iruda.local";

async function getOrCreateTestUser() {
  const existing = await prisma.user.findUnique({ where: { email: TEST_LOGIN_EMAIL } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(`test-login-${Date.now()}`, 10);
  return prisma.user.create({
    data: {
      email: TEST_LOGIN_EMAIL,
      passwordHash,
      name: "테스트유저",
    },
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        testLogin: {},
      },
      authorize: async (credentials) => {
        if (credentials?.testLogin === "1") {
          const user = await getOrCreateTestUser();
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isOperator: user.isOperator,
          };
        }

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isOperator: user.isOperator,
        };
      },
    }),
  ],
});
