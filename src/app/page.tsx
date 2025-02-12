"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faCloud, faCloudRain, faSnowflake, faSmog, faCloudSun, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import "./WeatherForecast.css"; // CSSファイルを読み込む

interface WeatherData {
  date: string;
  time: string;
  weather: string;
  temp: number;
}

interface DailyWeather {
  date: string;
  morning?: WeatherData;
  afternoon?: WeatherData;
}

// 天気データ取得
const fetchWeatherForecast = async (city: string): Promise<DailyWeather[]> => {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ja`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("天気情報の取得に失敗しました");
    const data = await res.json();

    const dailyWeatherMap = new Map<string, DailyWeather>();

    data.list.forEach((forecast: any) => {
      const dateObj = new Date(forecast.dt * 1000);
      const dateStr = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
      const hour = dateObj.getHours();

      const weatherInfo: WeatherData = {
        date: dateStr,
        time: `${hour}:00`,
        weather: forecast.weather[0].main,
        temp: Math.round(forecast.main.temp),
      };

      if (!dailyWeatherMap.has(dateStr)) {
        dailyWeatherMap.set(dateStr, { date: dateStr });
      }

      const dailyData = dailyWeatherMap.get(dateStr)!;
      if (hour < 12 && !dailyData.morning) {
        dailyData.morning = weatherInfo;
      } else if (hour >= 12 && !dailyData.afternoon) {
        dailyData.afternoon = weatherInfo;
      }
    });

    return Array.from(dailyWeatherMap.values());
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 天気アイコン取得
const getWeatherIcon = (morning?: string, afternoon?: string): IconDefinition => {
  if (morning === afternoon) {
    return getSingleWeatherIcon(morning);
  }
  return faCloudSun; // 午前と午後が違う場合、曇り/晴れのアイコン
};

// 個別天気アイコン
const getSingleWeatherIcon = (weather?: string): IconDefinition => {
  switch (weather) {
    case "Clear":
      return faSun;
    case "Clouds":
      return faCloud;
    case "Rain":
      return faCloudRain;
    case "Snow":
      return faSnowflake;
    case "Mist":
    case "Fog":
      return faSmog;
    case "Drizzle":
      return faCloudSun;
    default:
      return faCloud;
  }
};

export default function WeatherForecast() {
  const [weatherData, setWeatherData] = useState<DailyWeather[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const city = "Tokyo";

  useEffect(() => {
    fetchWeatherForecast(city).then(setWeatherData);
  }, []);

  useEffect(() => {
    if (weatherData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % weatherData.length);
    }, 3000); // 3秒ごとに次の日へ

    return () => clearInterval(interval);
  }, [weatherData]);

  if (weatherData.length === 0) return <p className="loading">天気情報を取得中...</p>;

  const today = weatherData[currentIndex];

  return (
    <div className="weather-container">
      <h2 className="title">📅 天気予報</h2>
      <div className="weather-card fade-in">
        <p className="date">{today.date}</p>

        {/* 天気アイコン（午前 + 午後） */}
        <div className="weather-icon">
          <FontAwesomeIcon icon={getWeatherIcon(today.morning?.weather, today.afternoon?.weather)} size="4x" />
        </div>

        {/* 午前・午後の詳細 */}
        <div className="weather-details">
          <div className="morning">
            <p className="time-label">🌅 午前</p>
            {today.morning ? (
              <>
                <p>{today.morning.weather}</p>
                <p>{today.morning.temp}℃</p>
              </>
            ) : (
              <p>データなし</p>
            )}
          </div>

          <div className="afternoon">
            <p className="time-label">🌇 午後</p>
            {today.afternoon ? (
              <>
                <p>{today.afternoon.weather}</p>
                <p>{today.afternoon.temp}℃</p>
              </>
            ) : (
              <p>データなし</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
