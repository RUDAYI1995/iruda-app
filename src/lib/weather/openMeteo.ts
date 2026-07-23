const WEATHER_CODE_MAP: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "맑음" },
  1: { emoji: "🌤️", label: "대체로 맑음" },
  2: { emoji: "⛅", label: "구름 조금" },
  3: { emoji: "☁️", label: "흐림" },
  45: { emoji: "🌫️", label: "안개" },
  48: { emoji: "🌫️", label: "서리 안개" },
  51: { emoji: "🌦️", label: "이슬비" },
  53: { emoji: "🌦️", label: "이슬비" },
  55: { emoji: "🌧️", label: "강한 이슬비" },
  61: { emoji: "🌧️", label: "비" },
  63: { emoji: "🌧️", label: "비" },
  65: { emoji: "🌧️", label: "강한 비" },
  71: { emoji: "🌨️", label: "눈" },
  73: { emoji: "🌨️", label: "눈" },
  75: { emoji: "❄️", label: "강한 눈" },
  80: { emoji: "🌦️", label: "소나기" },
  81: { emoji: "🌧️", label: "소나기" },
  82: { emoji: "⛈️", label: "강한 소나기" },
  95: { emoji: "⛈️", label: "뇌우" },
  96: { emoji: "⛈️", label: "우박 동반 뇌우" },
  99: { emoji: "⛈️", label: "강한 우박 동반 뇌우" },
};

export function describeWeatherCode(code: number) {
  return WEATHER_CODE_MAP[code] ?? { emoji: "🌡️", label: "알 수 없음" };
}

export type SimpleCondition = "clear" | "cloudy" | "rain" | "thunder";

const THUNDER_CODES = new Set([95, 96, 99]);
const RAIN_CODES = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 71, 73, 75]);
const CLOUDY_CODES = new Set([2, 3, 45, 48]);

export function getSimpleCondition(code: number): SimpleCondition {
  if (THUNDER_CODES.has(code)) return "thunder";
  if (RAIN_CODES.has(code)) return "rain";
  if (CLOUDY_CODES.has(code)) return "cloudy";
  return "clear";
}

export async function geocodeCity(city: string) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ko&format=json`
  );
  if (!res.ok) throw new Error("지역 검색에 실패했어요.");
  const data = await res.json();
  const result = data?.results?.[0];
  if (!result) return null;
  return {
    name: result.name as string,
    country: result.country as string,
    latitude: result.latitude as number,
    longitude: result.longitude as number,
  };
}

export async function getCurrentWeather(latitude: number, longitude: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`
  );
  if (!res.ok) throw new Error("날씨 정보를 가져오지 못했어요.");
  const data = await res.json();
  return {
    temperature: data?.current?.temperature_2m as number,
    weatherCode: data?.current?.weather_code as number,
    windSpeed: data?.current?.wind_speed_10m as number,
  };
}

// arrivalLocalTime: "YYYY-MM-DDTHH:mm" in the DESTINATION's local time (timezone=auto aligns hourly.time to it)
export async function getForecastAt(
  latitude: number,
  longitude: number,
  arrivalLocalTime: string
) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=16`
  );
  if (!res.ok) throw new Error("날씨 정보를 가져오지 못했어요.");
  const data = await res.json();

  const times: string[] = data?.hourly?.time ?? [];
  const temps: number[] = data?.hourly?.temperature_2m ?? [];
  const codes: number[] = data?.hourly?.weather_code ?? [];
  const winds: number[] = data?.hourly?.wind_speed_10m ?? [];

  const targetPrefix = arrivalLocalTime.slice(0, 13); // "YYYY-MM-DDTHH"
  let index = times.findIndex((t) => t.startsWith(targetPrefix));
  if (index === -1) {
    // fall back to the closest available hour within range
    const targetMs = new Date(arrivalLocalTime).getTime();
    let closestDiff = Infinity;
    times.forEach((t, i) => {
      const diff = Math.abs(new Date(t).getTime() - targetMs);
      if (diff < closestDiff) {
        closestDiff = diff;
        index = i;
      }
    });
  }

  if (index === -1 || index >= times.length) {
    return null;
  }

  return {
    time: times[index],
    temperature: temps[index],
    weatherCode: codes[index],
    windSpeed: winds[index],
  };
}
