const BASE_URL = "http://apis.data.go.kr/1613000";

// TAGO(국토교통부 전국 버스정류소 정보) API가 실제로 쓰는 도시코드표 그대로 사용.
// ⚠️ 서울특별시는 이 API 자체에 포함되어 있지 않음 — 서울은 별도의 서울시 TOPIS API가 필요해서 여기 목록엔 없음.
export const CITY_CODES = [
  { code: "12", name: "세종" },
  { code: "21", name: "부산" },
  { code: "22", name: "대구" },
  { code: "23", name: "인천" },
  { code: "24", name: "광주" },
  { code: "25", name: "대전/계룡" },
  { code: "26", name: "울산" },
  { code: "39", name: "제주" },
  { code: "31010", name: "수원" },
  { code: "31020", name: "성남" },
  { code: "31030", name: "의정부" },
  { code: "31040", name: "안양" },
  { code: "31050", name: "부천" },
  { code: "31060", name: "광명" },
  { code: "31070", name: "평택" },
  { code: "31090", name: "안산" },
  { code: "31100", name: "고양" },
  { code: "31130", name: "남양주" },
  { code: "31190", name: "용인" },
  { code: "31200", name: "파주" },
  { code: "31230", name: "김포" },
  { code: "31240", name: "화성" },
  { code: "32010", name: "춘천" },
  { code: "32020", name: "원주/횡성" },
  { code: "33010", name: "청주" },
  { code: "33020", name: "충주" },
  { code: "34010", name: "천안" },
  { code: "34040", name: "아산" },
  { code: "35010", name: "전주" },
  { code: "35020", name: "군산" },
  { code: "36010", name: "목포" },
  { code: "36020", name: "여수" },
  { code: "36030", name: "순천" },
  { code: "37010", name: "포항" },
  { code: "37020", name: "경주" },
  { code: "37050", name: "구미" },
  { code: "37040", name: "안동" },
  { code: "38010", name: "창원" },
  { code: "38030", name: "진주" },
  { code: "38070", name: "김해" },
  { code: "38090", name: "거제" },
  { code: "38100", name: "양산" },
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
