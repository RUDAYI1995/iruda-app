import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendPushToUser } from "@/lib/push";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  try {
    await sendPushToUser(session.user.id, {
      title: "루다알림제 🔔",
      body: "냥! 알림이 잘 도착했어요. 이제 루다월드 소식을 놓치지 않을 수 있어요.",
      url: "/home",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("테스트 알림 발송 실패", error);
    return NextResponse.json({ error: "알림 발송에 실패했어요" }, { status: 500 });
  }
}
