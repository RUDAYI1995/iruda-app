export type ProductCategory = "먹거리" | "면세점" | "여행상품";
export type ProductCondition = "신규상품" | "중고상품";

export type Country = {
  code: string;
  name: string;
  flag: string;
};

export type Product = {
  id: string;
  countryCode: string;
  name: string;
  price: number;
  condition: ProductCondition;
  category: ProductCategory;
  seller: string;
  image: string;
  description: string;
};

export const COUNTRIES: Country[] = [
  { code: "jp", name: "일본", flag: "🇯🇵" },
  { code: "us", name: "미국", flag: "🇺🇸" },
  { code: "fr", name: "프랑스", flag: "🇫🇷" },
  { code: "th", name: "태국", flag: "🇹🇭" },
  { code: "vn", name: "베트남", flag: "🇻🇳" },
  { code: "it", name: "이탈리아", flag: "🇮🇹" },
  { code: "gb", name: "영국", flag: "🇬🇧" },
  { code: "au", name: "호주", flag: "🇦🇺" },
  { code: "cn", name: "중국", flag: "🇨🇳" },
  { code: "tw", name: "대만", flag: "🇹🇼" },
  { code: "hk", name: "홍콩", flag: "🇭🇰" },
  { code: "sg", name: "싱가포르", flag: "🇸🇬" },
  { code: "ph", name: "필리핀", flag: "🇵🇭" },
  { code: "id", name: "인도네시아", flag: "🇮🇩" },
  { code: "my", name: "말레이시아", flag: "🇲🇾" },
  { code: "de", name: "독일", flag: "🇩🇪" },
  { code: "es", name: "스페인", flag: "🇪🇸" },
  { code: "ch", name: "스위스", flag: "🇨🇭" },
  { code: "nl", name: "네덜란드", flag: "🇳🇱" },
  { code: "ca", name: "캐나다", flag: "🇨🇦" },
  { code: "mx", name: "멕시코", flag: "🇲🇽" },
  { code: "tr", name: "터키", flag: "🇹🇷" },
  { code: "gr", name: "그리스", flag: "🇬🇷" },
  { code: "nz", name: "뉴질랜드", flag: "🇳🇿" },
];

const PHOTOS = {
  snack1: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=600&q=80",
  snack2: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
  perfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80",
  cosmetics: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
  luggage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
  ticket: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
  wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
};

const SELLERS = ["김소심", "이조용", "정이동", "박안부", "최자유", "먼치(흰색이)"];

function seller(seed: number) {
  return SELLERS[seed % SELLERS.length];
}

// 국가별 실제 특산품 느낌으로 직접 구성한 5개 매물 — 신규/중고, 먹거리/면세점/여행상품 골고루 섞음
const PRODUCT_TEMPLATES: Record<string, Omit<Product, "id" | "countryCode">[]> = {
  jp: [
    { name: "도쿄 공항 면세점 킷캣 말차맛 세트", price: 12000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack1, description: "직접 사와서 하나도 안 뜯었어요. 유통기한 넉넉해요." },
    { name: "시세이도 면세점 립밤 3종", price: 18000, condition: "신규상품", category: "면세점", seller: seller(1), image: PHOTOS.cosmetics, description: "면세점 박스 그대로, 미개봉이에요." },
    { name: "오사카 유니버설 스튜디오 1일권(미사용)", price: 65000, condition: "신규상품", category: "여행상품", seller: seller(2), image: PHOTOS.ticket, description: "일정이 바뀌어서 못 갔어요. 날짜 지정 안 된 티켓이에요." },
    { name: "여행용 캐리어(일본 왕복 1회 사용)", price: 45000, condition: "중고상품", category: "여행상품", seller: seller(3), image: PHOTOS.luggage, description: "기스 거의 없고 바퀴 튼튼해요." },
    { name: "교토 우지 말차 과자 선물세트", price: 15000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.snack2, description: "선물 받았는데 저는 이미 있어서 나눔가로 팔아요." },
  ],
  us: [
    { name: "허쉬/오레오 대용량 스낵 박스", price: 20000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.snack1, description: "코스트코에서 대량으로 사왔는데 남았어요." },
    { name: "JFK 공항 면세점 향수(미개봉)", price: 55000, condition: "신규상품", category: "면세점", seller: seller(2), image: PHOTOS.perfume, description: "선물용으로 샀는데 중복돼서 팔아요." },
    { name: "뉴욕 브로드웨이 뮤지컬 티켓 1매", price: 90000, condition: "신규상품", category: "여행상품", seller: seller(3), image: PHOTOS.ticket, description: "동행이 취소돼서 혼자 못 써요, 날짜 확인해주세요." },
    { name: "미국 여행용 하드케이스 캐리어(중고)", price: 38000, condition: "중고상품", category: "여행상품", seller: seller(4), image: PHOTOS.luggage, description: "왕복 2회 사용, 잔기스 있어요." },
    { name: "리세스/스키틀즈 초콜릿 모음", price: 13000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack2, description: "미개봉 그대로예요." },
  ],
  fr: [
    { name: "파리 공항 면세점 마카롱 세트", price: 22000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.snack1, description: "당일 구매, 유통기한 넉넉해요." },
    { name: "샤넬/디올 면세점 향수(미개봉)", price: 95000, condition: "신규상품", category: "면세점", seller: seller(3), image: PHOTOS.perfume, description: "면세 서류 같이 드려요." },
    { name: "보르도 와인 1병(미개봉)", price: 40000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.wine, description: "현지 와이너리에서 직접 산 거예요." },
    { name: "에펠탑 전망대 패스트트랙 티켓", price: 48000, condition: "신규상품", category: "여행상품", seller: seller(0), image: PHOTOS.ticket, description: "일정 변경으로 못 써요." },
    { name: "여행용 캐리어(프랑스 1회 사용)", price: 42000, condition: "중고상품", category: "여행상품", seller: seller(1), image: PHOTOS.luggage, description: "상태 좋아요, 직거래도 가능해요." },
  ],
  th: [
    { name: "태국 망고 말랭이/스낵 세트", price: 9000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack2, description: "미개봉, 달달하고 맛있어요." },
    { name: "방콕 공항 면세점 선크림", price: 16000, condition: "신규상품", category: "면세점", seller: seller(4), image: PHOTOS.cosmetics, description: "여행 다녀와서 안 쓴 거예요." },
    { name: "푸켓 스노클링 투어 바우처", price: 55000, condition: "신규상품", category: "여행상품", seller: seller(0), image: PHOTOS.ticket, description: "일정 안 맞아서 못 갔어요, 기간 여유 있어요." },
    { name: "태국 여행용 캐리어(중고)", price: 30000, condition: "중고상품", category: "여행상품", seller: seller(1), image: PHOTOS.luggage, description: "가볍고 튼튼해요, 스크래치 조금 있어요." },
    { name: "태국 커피/코코넛 과자 모음", price: 11000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.coffee, description: "현지 마트에서 직접 산 거예요." },
  ],
  vn: [
    { name: "베트남 G7 커피 믹스 박스", price: 10000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.coffee, description: "미개봉, 대용량이에요." },
    { name: "다낭 공항 면세점 화장품 세트", price: 25000, condition: "신규상품", category: "면세점", seller: seller(0), image: PHOTOS.cosmetics, description: "선물받았는데 안 써서 팔아요." },
    { name: "하롱베이 크루즈 투어 티켓", price: 60000, condition: "신규상품", category: "여행상품", seller: seller(1), image: PHOTOS.ticket, description: "동행 취소로 못 갔어요." },
    { name: "베트남 여행용 보스턴백(중고)", price: 15000, condition: "중고상품", category: "여행상품", seller: seller(2), image: PHOTOS.luggage, description: "1회 사용, 상태 깨끗해요." },
    { name: "베트남 코코넛 캔디/과자", price: 8000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack1, description: "미개봉이에요." },
  ],
  it: [
    { name: "이탈리아 올리브오일/파스타 세트", price: 18000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack2, description: "현지 마트에서 직접 산 거예요." },
    { name: "밀라노 면세점 향수(미개봉)", price: 70000, condition: "신규상품", category: "면세점", seller: seller(1), image: PHOTOS.perfume, description: "박스 그대로예요." },
    { name: "콜로세움 패스트트랙 입장권", price: 35000, condition: "신규상품", category: "여행상품", seller: seller(2), image: PHOTOS.ticket, description: "일정 안 맞아서 못 썼어요." },
    { name: "이탈리아 와인 1병", price: 32000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.wine, description: "선물로 받았는데 술을 안 마셔서요." },
    { name: "여행용 캐리어(이탈리아 왕복 1회)", price: 40000, condition: "중고상품", category: "여행상품", seller: seller(4), image: PHOTOS.luggage, description: "상태 좋고 바퀴 소리 없어요." },
  ],
  gb: [
    { name: "런던 트와이닝 홍차 세트", price: 14000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.snack1, description: "미개봉, 종류별로 있어요." },
    { name: "히드로 공항 면세점 화장품", price: 30000, condition: "신규상품", category: "면세점", seller: seller(2), image: PHOTOS.cosmetics, description: "선물 중복돼서 팔아요." },
    { name: "런던아이 패스트트랙 티켓", price: 32000, condition: "신규상품", category: "여행상품", seller: seller(3), image: PHOTOS.ticket, description: "날짜 협의 가능해요." },
    { name: "영국 여행용 캐리어(중고)", price: 35000, condition: "중고상품", category: "여행상품", seller: seller(4), image: PHOTOS.luggage, description: "2회 사용, 잔기스 약간 있어요." },
    { name: "영국 쇼트브레드 쿠키 세트", price: 9000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack2, description: "미개봉이에요." },
  ],
  au: [
    { name: "호주 마카다미아/과자 세트", price: 13000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.snack1, description: "현지 마트에서 산 거예요, 미개봉." },
    { name: "시드니 공항 면세점 선크림/화장품", price: 20000, condition: "신규상품", category: "면세점", seller: seller(3), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "블루마운틴 투어 바우처", price: 58000, condition: "신규상품", category: "여행상품", seller: seller(4), image: PHOTOS.ticket, description: "일정 취소로 못 갔어요." },
    { name: "호주 여행용 캐리어(중고)", price: 33000, condition: "중고상품", category: "여행상품", seller: seller(0), image: PHOTOS.luggage, description: "가볍고 상태 좋아요." },
    { name: "호주 티/꿀 세트", price: 16000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.coffee, description: "미개봉, 선물받은 거예요." },
  ],
  cn: [
    { name: "베이징 특산 말린 과일/차 세트", price: 12000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack1, description: "미개봉, 현지 마트 구매." },
    { name: "상하이 공항 면세점 화장품", price: 28000, condition: "신규상품", category: "면세점", seller: seller(1), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "만리장성 투어 바우처", price: 50000, condition: "신규상품", category: "여행상품", seller: seller(2), image: PHOTOS.ticket, description: "일정 취소로 못 갔어요." },
    { name: "중국 여행용 캐리어(중고)", price: 32000, condition: "중고상품", category: "여행상품", seller: seller(3), image: PHOTOS.luggage, description: "1회 사용, 상태 좋아요." },
    { name: "중국 우롱차/보이차 세트", price: 15000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.coffee, description: "선물받았는데 안 마셔서요." },
  ],
  tw: [
    { name: "타이베이 펑리수(파인애플 케이크) 세트", price: 11000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.snack2, description: "미개봉, 유통기한 넉넉해요." },
    { name: "타오위안 공항 면세점 화장품", price: 22000, condition: "신규상품", category: "면세점", seller: seller(2), image: PHOTOS.cosmetics, description: "선물 중복돼서 팔아요." },
    { name: "지우펀 야경 투어 티켓", price: 40000, condition: "신규상품", category: "여행상품", seller: seller(3), image: PHOTOS.ticket, description: "날짜 협의 가능해요." },
    { name: "대만 여행용 보스턴백(중고)", price: 16000, condition: "중고상품", category: "여행상품", seller: seller(4), image: PHOTOS.luggage, description: "가볍고 깨끗해요." },
    { name: "대만 누가 크래커 박스", price: 9000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack1, description: "미개봉이에요." },
  ],
  hk: [
    { name: "홍콩 에그롤/과자 세트", price: 13000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.snack2, description: "현지에서 직접 산 거예요." },
    { name: "홍콩 공항 면세점 향수", price: 60000, condition: "신규상품", category: "면세점", seller: seller(3), image: PHOTOS.perfume, description: "미개봉, 박스 있어요." },
    { name: "빅토리아 피크 트램 왕복권", price: 25000, condition: "신규상품", category: "여행상품", seller: seller(4), image: PHOTOS.ticket, description: "일정이 안 맞아서 못 썼어요." },
    { name: "홍콩 여행용 캐리어(중고)", price: 37000, condition: "중고상품", category: "여행상품", seller: seller(0), image: PHOTOS.luggage, description: "2회 사용, 상태 양호해요." },
    { name: "홍콩 밀크티 티백 세트", price: 10000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.coffee, description: "미개봉이에요." },
  ],
  sg: [
    { name: "싱가포르 바쿠테/커야잼 세트", price: 14000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack1, description: "미개봉, 선물용으로 샀어요." },
    { name: "창이공항 면세점 화장품", price: 26000, condition: "신규상품", category: "면세점", seller: seller(4), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "가든스바이더베이 입장권", price: 30000, condition: "신규상품", category: "여행상품", seller: seller(0), image: PHOTOS.ticket, description: "동행 취소로 못 갔어요." },
    { name: "싱가포르 여행용 캐리어(중고)", price: 34000, condition: "중고상품", category: "여행상품", seller: seller(1), image: PHOTOS.luggage, description: "가볍고 튼튼해요." },
    { name: "싱가포르 TWG 티백 세트", price: 18000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.coffee, description: "미개봉, 선물받은 거예요." },
  ],
  ph: [
    { name: "필리핀 망고 말랭이 대용량", price: 9000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.snack2, description: "미개봉, 진짜 달아요." },
    { name: "마닐라 공항 면세점 화장품", price: 20000, condition: "신규상품", category: "면세점", seller: seller(0), image: PHOTOS.cosmetics, description: "선물 중복돼서 팔아요." },
    { name: "보라카이 아일랜드호핑 투어권", price: 45000, condition: "신규상품", category: "여행상품", seller: seller(1), image: PHOTOS.ticket, description: "일정 취소로 못 갔어요." },
    { name: "필리핀 여행용 보스턴백(중고)", price: 14000, condition: "중고상품", category: "여행상품", seller: seller(2), image: PHOTOS.luggage, description: "1회 사용, 깨끗해요." },
    { name: "필리핀 코코넛 과자 세트", price: 8000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack1, description: "미개봉이에요." },
  ],
  id: [
    { name: "발리 코피 루왁 원두(미개봉)", price: 25000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.coffee, description: "현지 농장에서 직접 산 거예요." },
    { name: "인도네시아 공항 면세점 화장품", price: 19000, condition: "신규상품", category: "면세점", seller: seller(1), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "우붓 스파/투어 바우처", price: 40000, condition: "신규상품", category: "여행상품", seller: seller(2), image: PHOTOS.ticket, description: "동행 취소로 못 갔어요." },
    { name: "발리 여행용 캐리어(중고)", price: 29000, condition: "중고상품", category: "여행상품", seller: seller(3), image: PHOTOS.luggage, description: "가볍고 상태 좋아요." },
    { name: "인도네시아 크리스피 과자 세트", price: 7000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.snack2, description: "미개봉이에요." },
  ],
  my: [
    { name: "말레이시아 백호두과자 세트", price: 12000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.snack1, description: "미개봉, 현지 마트 구매." },
    { name: "쿠알라룸푸르 공항 면세점 향수", price: 50000, condition: "신규상품", category: "면세점", seller: seller(2), image: PHOTOS.perfume, description: "선물받았는데 안 써서요." },
    { name: "페트로나스 트윈타워 전망대권", price: 32000, condition: "신규상품", category: "여행상품", seller: seller(3), image: PHOTOS.ticket, description: "날짜 협의 가능해요." },
    { name: "말레이시아 여행용 캐리어(중고)", price: 31000, condition: "중고상품", category: "여행상품", seller: seller(4), image: PHOTOS.luggage, description: "2회 사용, 상태 좋아요." },
    { name: "말레이시아 화이트커피 믹스", price: 10000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.coffee, description: "미개봉이에요." },
  ],
  de: [
    { name: "독일 하리보/초콜릿 대용량", price: 14000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.snack2, description: "미개봉, 대량 구매했어요." },
    { name: "프랑크푸르트 공항 면세점 화장품", price: 32000, condition: "신규상품", category: "면세점", seller: seller(3), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "노이슈반슈타인성 입장권", price: 28000, condition: "신규상품", category: "여행상품", seller: seller(4), image: PHOTOS.ticket, description: "일정 안 맞아서 못 썼어요." },
    { name: "독일 여행용 캐리어(중고)", price: 41000, condition: "중고상품", category: "여행상품", seller: seller(0), image: PHOTOS.luggage, description: "상태 좋고 튼튼해요." },
    { name: "독일 리즐링 와인 1병", price: 25000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.wine, description: "선물로 받았는데 술을 안 마셔서요." },
  ],
  es: [
    { name: "스페인 하몽/올리브 세트", price: 30000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack1, description: "현지 마트에서 직접 산 거예요." },
    { name: "마드리드 공항 면세점 향수", price: 65000, condition: "신규상품", category: "면세점", seller: seller(4), image: PHOTOS.perfume, description: "미개봉, 박스 있어요." },
    { name: "사그라다 파밀리아 패스트트랙권", price: 38000, condition: "신규상품", category: "여행상품", seller: seller(0), image: PHOTOS.ticket, description: "동행 취소로 못 갔어요." },
    { name: "스페인 여행용 캐리어(중고)", price: 39000, condition: "중고상품", category: "여행상품", seller: seller(1), image: PHOTOS.luggage, description: "1회 사용, 깨끗해요." },
    { name: "스페인 리오하 와인 1병", price: 28000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.wine, description: "미개봉이에요." },
  ],
  ch: [
    { name: "스위스 린트 초콜릿 대용량", price: 25000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.snack2, description: "미개봉, 현지 마트 구매." },
    { name: "취리히 공항 면세점 시계 파우치", price: 45000, condition: "신규상품", category: "면세점", seller: seller(0), image: PHOTOS.cosmetics, description: "선물 중복돼서 팔아요." },
    { name: "융프라우요흐 등반열차 티켓", price: 80000, condition: "신규상품", category: "여행상품", seller: seller(1), image: PHOTOS.ticket, description: "일정 취소로 못 갔어요." },
    { name: "스위스 여행용 캐리어(중고)", price: 44000, condition: "중고상품", category: "여행상품", seller: seller(2), image: PHOTOS.luggage, description: "상태 아주 좋아요." },
    { name: "스위스 치즈퐁뒤 세트", price: 20000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack1, description: "미개봉이에요." },
  ],
  nl: [
    { name: "네덜란드 스트룹와플 세트", price: 11000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack2, description: "미개봉, 현지 마트 구매." },
    { name: "스키폴 공항 면세점 화장품", price: 27000, condition: "신규상품", category: "면세점", seller: seller(1), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "안네프랑크의 집 입장권", price: 22000, condition: "신규상품", category: "여행상품", seller: seller(2), image: PHOTOS.ticket, description: "날짜 협의 가능해요." },
    { name: "네덜란드 여행용 캐리어(중고)", price: 36000, condition: "중고상품", category: "여행상품", seller: seller(3), image: PHOTOS.luggage, description: "2회 사용, 상태 좋아요." },
    { name: "네덜란드 고다치즈 미니팩", price: 15000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.snack1, description: "미개봉이에요." },
  ],
  ca: [
    { name: "캐나다 메이플시럽 세트", price: 18000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.snack1, description: "미개봉, 현지 마트 구매." },
    { name: "토론토 공항 면세점 향수", price: 55000, condition: "신규상품", category: "면세점", seller: seller(2), image: PHOTOS.perfume, description: "선물받았는데 안 써서요." },
    { name: "나이아가라 폭포 크루즈 티켓", price: 42000, condition: "신규상품", category: "여행상품", seller: seller(3), image: PHOTOS.ticket, description: "일정 취소로 못 갔어요." },
    { name: "캐나다 여행용 캐리어(중고)", price: 43000, condition: "중고상품", category: "여행상품", seller: seller(4), image: PHOTOS.luggage, description: "상태 아주 좋아요." },
    { name: "캐나다 메이플쿠키 박스", price: 12000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack2, description: "미개봉이에요." },
  ],
  mx: [
    { name: "멕시코 타코 소스/향신료 세트", price: 13000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.snack1, description: "현지 마트에서 직접 산 거예요." },
    { name: "칸쿤 공항 면세점 화장품", price: 24000, condition: "신규상품", category: "면세점", seller: seller(3), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "치첸이트사 유적 투어권", price: 50000, condition: "신규상품", category: "여행상품", seller: seller(4), image: PHOTOS.ticket, description: "동행 취소로 못 갔어요." },
    { name: "멕시코 여행용 캐리어(중고)", price: 30000, condition: "중고상품", category: "여행상품", seller: seller(0), image: PHOTOS.luggage, description: "1회 사용, 깨끗해요." },
    { name: "멕시코 데킬라 초콜릿", price: 16000, condition: "신규상품", category: "먹거리", seller: seller(1), image: PHOTOS.snack2, description: "미개봉이에요." },
  ],
  tr: [
    { name: "터키 딜라이트(로쿰) 세트", price: 12000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack1, description: "미개봉, 현지 마트 구매." },
    { name: "이스탄불 공항 면세점 향수", price: 48000, condition: "신규상품", category: "면세점", seller: seller(4), image: PHOTOS.perfume, description: "선물 중복돼서 팔아요." },
    { name: "카파도키아 열기구 투어권", price: 90000, condition: "신규상품", category: "여행상품", seller: seller(0), image: PHOTOS.ticket, description: "일정 안 맞아서 못 갔어요." },
    { name: "터키 여행용 캐리어(중고)", price: 28000, condition: "중고상품", category: "여행상품", seller: seller(1), image: PHOTOS.luggage, description: "가볍고 상태 좋아요." },
    { name: "터키 애플티 세트", price: 9000, condition: "신규상품", category: "먹거리", seller: seller(2), image: PHOTOS.coffee, description: "미개봉이에요." },
  ],
  gr: [
    { name: "그리스 올리브오일/올리브 세트", price: 20000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.snack2, description: "현지 농장에서 직접 산 거예요." },
    { name: "아테네 공항 면세점 화장품", price: 26000, condition: "신규상품", category: "면세점", seller: seller(0), image: PHOTOS.cosmetics, description: "박스 그대로예요." },
    { name: "산토리니 선셋 크루즈 티켓", price: 65000, condition: "신규상품", category: "여행상품", seller: seller(1), image: PHOTOS.ticket, description: "일정 취소로 못 갔어요." },
    { name: "그리스 여행용 캐리어(중고)", price: 37000, condition: "중고상품", category: "여행상품", seller: seller(2), image: PHOTOS.luggage, description: "2회 사용, 상태 좋아요." },
    { name: "그리스 꿀/요거트 세트", price: 15000, condition: "신규상품", category: "먹거리", seller: seller(3), image: PHOTOS.snack1, description: "미개봉이에요." },
  ],
  nz: [
    { name: "뉴질랜드 마누카 꿀", price: 35000, condition: "신규상품", category: "먹거리", seller: seller(0), image: PHOTOS.snack1, description: "미개봉, 현지 마트 구매." },
    { name: "오클랜드 공항 면세점 화장품", price: 23000, condition: "신규상품", category: "면세점", seller: seller(1), image: PHOTOS.cosmetics, description: "선물받았는데 안 써서요." },
    { name: "밀포드사운드 크루즈 투어권", price: 70000, condition: "신규상품", category: "여행상품", seller: seller(2), image: PHOTOS.ticket, description: "동행 취소로 못 갔어요." },
    { name: "뉴질랜드 여행용 캐리어(중고)", price: 40000, condition: "중고상품", category: "여행상품", seller: seller(3), image: PHOTOS.luggage, description: "상태 아주 좋아요." },
    { name: "뉴질랜드 양털 초콜릿 과자", price: 14000, condition: "신규상품", category: "먹거리", seller: seller(4), image: PHOTOS.snack2, description: "미개봉이에요." },
  ],
};

export function getProductsForCountry(countryCode: string): Product[] {
  const templates = PRODUCT_TEMPLATES[countryCode] ?? [];
  return templates.map((t, i) => ({
    ...t,
    id: `${countryCode}-${i}`,
    countryCode,
  }));
}
