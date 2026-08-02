import { prisma } from "@/lib/prisma";

// 파티/개인이 무언가를 저장하거나 계획을 세울 때마다 루다알림제에 기록을 남기는 공용 헬퍼.
// sendAt을 현재 시각으로 남겨서 "예약 알림"이 아니라 즉시 보이는 메모/기록으로 남음.
export async function logRudaAlert(userId: string, title: string, body: string) {
  await prisma.scheduledNotification.create({
    data: {
      userId,
      createdById: userId,
      title,
      body,
      sendAt: new Date(),
    },
  });
}
