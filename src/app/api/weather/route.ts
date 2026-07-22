import { NextRequest, NextResponse } from "next/server";
import { geocodeCity, getCurrentWeather, getForecastAt } from "@/lib/weather/openMeteo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.trim();
  const arrival = searchParams.get("arrival")?.trim(); // "YYYY-MM-DDTHH:mm", destination local time
  if (!city) {
    return NextResponse.json({ error: "여행지를 입력해주세요." }, { status: 400 });
  }

  try {
    const place = await geocodeCity(city);
    if (!place) {
      return NextResponse.json({ error: "해당 여행지를 찾을 수 없어요." }, { status: 404 });
    }

    if (arrival) {
      const forecast = await getForecastAt(place.latitude, place.longitude, arrival);
      if (!forecast) {
        return NextResponse.json(
          { error: "해당 시간은 예보 범위(약 16일 이내)를 벗어났어요." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        name: place.name,
        country: place.country,
        temperature: forecast.temperature,
        weatherCode: forecast.weatherCode,
        windSpeed: forecast.windSpeed,
        forecastTime: forecast.time,
      });
    }

    const weather = await getCurrentWeather(place.latitude, place.longitude);

    return NextResponse.json({
      name: place.name,
      country: place.country,
      temperature: weather.temperature,
      weatherCode: weather.weatherCode,
      windSpeed: weather.windSpeed,
    });
  } catch {
    return NextResponse.json(
      { error: "날씨 정보를 가져오는 데 실패했어요. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
