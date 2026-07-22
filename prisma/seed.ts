import { PrismaClient, BroadCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.guideBooking.deleteMany();
  await prisma.guideProfile.deleteMany();
  await prisma.readyRoomParticipant.deleteMany();
  await prisma.readyRoom.deleteMany();
  await prisma.meetupMember.deleteMany();
  await prisma.meetup.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.personalityProfile.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await Promise.all(
    [
      { name: "김소심", email: "somsim@example.com", category: BroadCategory.CONFORMIST },
      { name: "이조용", email: "joyong@example.com", category: BroadCategory.CONFORMIST },
      { name: "박안부", email: "anbu@example.com", category: BroadCategory.SMALL_TALK },
      { name: "최자유", email: "jayu@example.com", category: BroadCategory.COHABITANT },
      { name: "정이동", email: "idong@example.com", category: BroadCategory.TRANSIT_ONLY },
    ].map((u) =>
      prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash,
          phoneVerified: true,
          personalityProfile: {
            create: {
              broadCategory: u.category,
              axisScores: { EI: 20, SN: 55, TF: 60, JP: 45 },
              pace: "여유로운",
              groupSizeComfort: 4,
              interests: JSON.stringify(["역사", "맛집", "사진"]),
              budgetLevel: 2,
              alcoholComfort: false,
              anxietyTriggers: JSON.stringify(["큰 소음", "낯선 사람과 눈맞춤"]),
              languages: JSON.stringify(["ko", "en"]),
            },
          },
        },
      })
    )
  );

  const activity = await prisma.activity.create({
    data: {
      name: "저압박 보드게임 모임",
      description: "말이 없어도 즐길 수 있는 협동형 보드게임으로 어색함을 풀어요.",
    },
  });

  const meetup = await prisma.meetup.create({
    data: {
      activityId: activity.id,
      location: "홍대 스터디카페 A",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      minSize: 3,
      maxSize: 5,
      members: {
        // 대분류가 같은(CONFORMIST) 유저들끼리만 묶는다 — users[0], users[1]이 CONFORMIST
        create: users.slice(0, 2).map((u) => ({ userId: u.id, matchScore: 78 })),
      },
    },
  });

  const guideUser = await prisma.user.create({
    data: {
      name: "가이드 이야나",
      email: "guide@example.com",
      passwordHash,
      role: "GUIDE",
      phoneVerified: true,
      guideProfile: {
        create: {
          status: "APPROVED",
          languages: JSON.stringify(["ko", "ja"]),
          region: "오사카",
          hourlyRate: 30000,
          rating: 4.8,
          bio: "낯가림 많은 여행자를 위한 조용한 오사카 가이드입니다.",
        },
      },
    },
  });

  await prisma.post.create({
    data: {
      authorId: users[0].id,
      title: "다음 주 오사카 같이 가실 분 계신가요?",
      body: "저처럼 낯을 많이 가리는데, 소규모로 편하게 다니실 분 찾아요.",
      category: "동행 구함",
      comments: {
        create: [{ authorId: users[1].id, body: "저도 관심 있어요!" }],
      },
    },
  });

  console.log(`Seed 완료: 유저 ${users.length + 1}명, 정모 1개, 가이드 1명, 게시글 1개`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
