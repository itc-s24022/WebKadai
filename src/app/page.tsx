"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faCloud,
  faCloudRain,
  faSnowflake,
  faSmog,
  faCloudSun,
  IconDefinition,
  faSearch, // 検索アイコンなど
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./WeatherForecast.module.css";

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

interface Forecast {
  dt: number;
  main: { temp: number };
  weather: { main: string }[];
}

interface ForecastResponse {
  city: { name: string };
  list: Forecast[];
}

interface ForecastResult {
  location: string;
  dailyWeather: DailyWeather[];
}

// 天気予報データの取得関数
const fetchWeatherForecast = async (
  lat?: number,
  lon?: number,
  fallbackCity: string = "Tokyo"
): Promise<ForecastResult> => {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  let url = "";

  if (lat !== undefined && lon !== undefined) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${fallbackCity}&appid=${API_KEY}&units=metric&lang=ja`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("天気情報の取得に失敗しました");
    const data: ForecastResponse = await res.json();

    const dailyWeatherMap = new Map<string, DailyWeather>();
    data.list.forEach((forecast: Forecast) => {
      const dateObj = new Date(forecast.dt * 1000);
      const dateStr = dateObj.toISOString().split("T")[0];
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

    return {
      location: data.city.name,
      dailyWeather: Array.from(dailyWeatherMap.values()),
    };
  } catch (error) {
    console.error(error);
    return { location: fallbackCity, dailyWeather: [] };
  }
};

// 天気に応じたアイコンの選択
const getWeatherIcon = (weather?: string): IconDefinition => {
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

// 天気に応じた色を返す関数
const getWeatherColor = (weather?: string): string => {
  switch (weather) {
    case "Clear":
      return "#FFD700"; // ゴールド（晴れ）
    case "Clouds":
      return "#B0C4DE"; // ライトスチールブルー（曇り）
    case "Rain":
      return "#1E90FF"; // ドジャーブルー（雨）
    case "Snow":
      return "#ADD8E6"; // ライトブルー（雪）
    case "Mist":
    case "Fog":
      return "#696969"; // ディムグレー（霧）
    case "Drizzle":
      return "#87CEFA"; // ライトスカイブルー（霧雨）
    default:
      return "#808080"; // グレー（その他）
  }
};

export default function WeatherForecast() {
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 追加: ユーザーが入力する都市名
  const [city, setCity] = useState("");

  // GPS で現在位置を取得して天気情報を取得（自動）
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherForecast(latitude, longitude).then(setForecastResult);
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error);
          // 位置情報が取得できない場合は、デフォルトの都市を使用
          fetchWeatherForecast().then(setForecastResult);
        }
      );
    } else {
      // ブラウザが位置情報に対応していない場合
      fetchWeatherForecast().then(setForecastResult);
    }
  }, []);

  // 天気情報の自動切り替え（5秒ごと）
  useEffect(() => {
    if (!forecastResult || forecastResult.dailyWeather.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        (prevIndex + 1) % forecastResult.dailyWeather.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [forecastResult]);

  // 追加: 手動で都市名を指定して天気情報を取得
  const handleFetchByCity = () => {
    if (!city) return;
    fetchWeatherForecast(undefined, undefined, city).then(setForecastResult);
  };

  if (!forecastResult || forecastResult.dailyWeather.length === 0)
    return (
      <div className="text-center mt-5">
        <p>🌤 天気情報を取得中...</p>
        {/* 手動入力欄を先に表示しておく */}
        <div className="mx-auto mt-3" style={{ maxWidth: "350px" }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="都市名を入力 (例: Tokyo)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleFetchByCity}>
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              天気を取得
            </button>
          </div>
        </div>
      </div>
    );

  const today = forecastResult.dailyWeather[currentIndex];
  const currentWeather = today.morning?.weather || today.afternoon?.weather;

  return (
    <div className={`container-fluid text-center vh-100 ${styles.bg}`}>
      <h1 className="my-4 display-3">🌎 {forecastResult.location} の天気予報</h1>

      {/* 手動入力欄 */}
      <div className="mx-auto mb-4" style={{ maxWidth: "400px" }}>
  <div className="input-group shadow-sm">
    <input
      type="text"
      className="form-control form-control-lg rounded-start-pill border-primary"
      placeholder="都市名を入力 (例: Tokyo)"
      value={city}
      onChange={(e) => setCity(e.target.value)}
    />
    <button className="btn btn-primary rounded-end-pill px-4" onClick={handleFetchByCity}>
      <FontAwesomeIcon icon={faSearch} className="me-2" />
      検索
    </button>
  </div>
</div>

      <div
        className="card shadow-lg rounded-4 bg-light bg-opacity-75 mx-auto"
        style={{ maxWidth: "700px" }}
      >
        <div className="card-body">
          <h2 className="display-4 fw-bold">{today.date}</h2>
          <FontAwesomeIcon
            icon={getWeatherIcon(currentWeather)}
            color={getWeatherColor(currentWeather)}
            size="8x"
            className="my-4"
          />
          <div className="d-flex justify-content-around mt-4">
            <div>
              <p className="fw-bold fs-4">🌅 午前</p>
              <p className="fs-5">{today.morning?.weather || "--"}</p>
              <p className="fs-3">{today.morning?.temp ?? "--"}℃</p>
            </div>
            <div>
              <p className="fw-bold fs-4">🌇 午後</p>
              <p className="fs-5">{today.afternoon?.weather || "--"}</p>
              <p className="fs-3">{today.afternoon?.temp ?? "--"}℃</p>
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-4 fs-5">2025 © WeatherApp</footer>
    </div>
  );
}
