// 관광 야시장 운영시간 — 대구시간(Asia/Seoul, KST) 기준 20:00~06:00
export function getDaeguHour(date: Date = new Date()): number {
  const kst = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return kst.getHours();
}

export function isNightMarketOpen(date: Date = new Date()): boolean {
  const hour = getDaeguHour(date);
  return hour >= 20 || hour < 6;
}

export function nextOpenOrCloseLabel(date: Date = new Date()): string {
  const hour = getDaeguHour(date);
  if (isNightMarketOpen(date)) {
    const hoursLeft = hour < 6 ? 6 - hour : 24 - hour + 6;
    return `오전 6시에 문을 닫아요 (약 ${hoursLeft}시간 후)`;
  }
  const hoursLeft = 20 - hour;
  return `오늘 밤 20:00에 열려요 (약 ${hoursLeft}시간 후)`;
}
