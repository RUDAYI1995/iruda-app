import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const existingUsers = await prisma.user.findMany({ take: 5 });
  if (existingUsers.length < 2) {
    throw new Error("데모용 정모를 만들 유저가 부족해요. 먼저 유저를 만들어주세요.");
  }
  const [u1, u2, u3, u4, u5] = existingUsers;

  const activities = [
    {
      name: "조용한 북카페 동행",
      description: "말없이 각자 책을 읽다가, 원할 때만 살짝 이야기를 나누는 모임이에요.",
      location: "연남동 북카페 소보로",
      daysFromNow: 2,
      members: [u1, u2],
    },
    {
      name: "저압박 보드게임 모임",
      description: "말이 없어도 즐길 수 있는 협동형 보드게임으로 어색함을 풀어요.",
      location: "홍대 스터디카페 B",
      daysFromNow: 5,
      members: [u2, u3],
    },
    {
      name: "야경 산책 동행",
      description: "대화 부담 없이 나란히 걷기만 해도 충분한 야경 산책 모임이에요.",
      location: "한강공원 반포지구",
      daysFromNow: 7,
      members: [u1, u3, u4].filter(Boolean),
    },
    {
      name: "미술관 조용히 둘러보기",
      description: "각자 속도로 전시를 보고, 마지막에만 짧게 소감을 나눠요.",
      location: "국립현대미술관 서울관",
      daysFromNow: 10,
      members: [u4, u5].filter(Boolean),
    },
    {
      name: "필름카메라 골목 산책",
      description: "사진 찍는 동안은 대화가 없어도 자연스러운, 사진 좋아하는 사람들의 모임이에요.",
      location: "익선동 한옥거리",
      daysFromNow: 14,
      members: [u2, u4].filter(Boolean),
    },
  ];

  for (const a of activities) {
    const activity = await prisma.activity.create({
      data: { name: a.name, description: a.description },
    });
    await prisma.meetup.create({
      data: {
        activityId: activity.id,
        location: a.location,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * a.daysFromNow),
        minSize: 3,
        maxSize: 5,
        members: {
          create: a.members.map((u) => ({ userId: u.id, matchScore: 70 + Math.round(Math.random() * 20) })),
        },
      },
    });
  }

  const guides = [
    {
      name: "가이드 하나코",
      email: "guide.hanako@example.com",
      languages: ["ko", "ja"],
      region: "도쿄",
      hourlyRate: 32000,
      rating: 4.9,
      bio: "낯가림 많은 여행자를 위한 조용한 도쿄 가이드입니다. 대화보다 편안한 동행을 우선해요.",
    },
    {
      name: "가이드 리안",
      email: "guide.rian@example.com",
      languages: ["ko", "en", "zh"],
      region: "타이베이",
      hourlyRate: 28000,
      rating: 4.7,
      bio: "소규모, 저자극 코스 위주로 안내하는 타이베이 가이드예요.",
    },
    {
      name: "가이드 소피아",
      email: "guide.sofia@example.com",
      languages: ["ko", "en"],
      region: "파리",
      hourlyRate: 40000,
      rating: 4.8,
      bio: "천천히, 조용히 파리를 걷는 걸 좋아하는 분들을 위한 가이드입니다.",
    },
    {
      name: "가이드 민트",
      email: "guide.mint@example.com",
      languages: ["ko"],
      region: "제주",
      hourlyRate: 20000,
      rating: 4.6,
      bio: "국내 제주 여행, 말 없이도 편한 동행이 되어드려요.",
    },
  ];

  for (const g of guides) {
    const existing = await prisma.user.findUnique({ where: { email: g.email } });
    if (existing) continue;
    await prisma.user.create({
      data: {
        name: g.name,
        email: g.email,
        passwordHash,
        role: "GUIDE",
        phoneVerified: true,
        guideProfile: {
          create: {
            status: "APPROVED",
            languages: JSON.stringify(g.languages),
            region: g.region,
            hourlyRate: g.hourlyRate,
            rating: g.rating,
            bio: g.bio,
          },
        },
      },
    });
  }

  console.log(`데모 데이터 추가 완료: 정모 ${activities.length}개, 가이드 ${guides.length}명 (기존 데이터는 유지됨)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
