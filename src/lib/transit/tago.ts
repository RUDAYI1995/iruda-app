const BASE_URL = "http://apis.data.go.kr/1613000";

export const CITY_CODES = [
  { code: "11", name: "서울" },
  { code: "21", name: "부산" },
  { code: "22", name: "대구" },
  { code: "23", name: "인천" },
  { code: "24", name: "광주" },
  { code: "25", name: "대전" },
  { code: "26", name: "울산" },
  { code: "29", name: "세종" },
  { code: "31", name: "경기" },
  { code: "32", name: "강원" },
  { code: "33", name: "충북" },
  { code: "34", name: "충남" },
  { code: "35", name: "전북" },
  { code: "36", name: "전남" },
  { code: "37", name: "경북" },
  { code: "38", name: "경남" },
  { code: "39", name: "제주" },
] as const;

export interface BusStop {
  nodeId: string;
  nodeNm: string;
  cityCode: string;
}

export interface BusArrival {
  routeNo: string;
  routeTp: string;
  arrTime: number; // 초 단위 도착 예정 시간
  arrPrevStationCnt: number; // 남은 정류소 수
}

function requireApiKey(): string {
  const key = process.env.TAGO_API_KEY;
  if (!key) {
    throw new Error(
      "TAGO_API_KEY가 설정되지 않았어요. data.go.kr에서 '국토교통부_전국 버스정류소 정보' 서비스키를 발급받아 .env에 넣어주세요."
    );
  }
  return key;
}

export async function searchBusStops(
  cityCode: string,
  nodeNm: string
): Promise<BusStop[]> {
  const serviceKey = requireApiKey();
  const url = `${BASE_URL}/BusSttnInfoInqireService/getSttnNoList?serviceKey=${serviceKey}&cityCode=${cityCode}&nodeNm=${encodeURIComponent(
    nodeNm
  )}&numOfRows=20&pageNo=1&_type=json`;

  const res = await fetch(url);
  const data = await res.json();

  const items = data?.response?.body?.items?.item;
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];

  return list.map((item: { nodeid: string; nodenm: string }) => ({
    nodeId: item.nodeid,
    nodeNm: item.nodenm,
    cityCode,
  }));
}

export async function getArrivals(
  cityCode: string,
  nodeId: string
): Promise<BusArrival[]> {
  const serviceKey = requireApiKey();
  const url = `${BASE_URL}/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${serviceKey}&cityCode=${cityCode}&nodeId=${nodeId}&numOfRows=20&pageNo=1&_type=json`;

  const res = await fetch(url);
  const data = await res.json();

  const items = data?.response?.body?.items?.item;
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];

  return list.map(
    (item: {
      routeno: string;
      routetp: string;
      arrtime: number;
      arrprevstationcnt: number;
    }) => ({
      routeNo: item.routeno,
      routeTp: item.routetp,
      arrTime: item.arrtime,
      arrPrevStationCnt: item.arrprevstationcnt,
    })
  );
}
