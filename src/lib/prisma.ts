import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// 프로덕션(Vercel 서버리스)에서도 캐싱해야, 워밍된 컨테이너가 재사용될 때마다
// 새 PrismaClient(= 새 커넥션 풀)를 만들지 않고 기존 걸 재사용함 —
// PgBouncer 트랜잭션 모드는 커넥션 수가 제한적이라 이게 특히 중요함
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

globalForPrisma.prisma = prisma;
