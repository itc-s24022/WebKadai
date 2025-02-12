// src/app/WeatherForecast.tsx
import React from 'react';
import './WeatherForecast.css'; // CSSをインポート

// 天気データの型を定義
interface WeatherData {
  date: string;
  morning: string;
  afternoon: string;
}

interface WeatherForecastProps {
  weatherData: WeatherData[];
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ weatherData }) => {
  return (
    <div className="weather-container">
      <h1 className="title">天気予報</h1>
      {weatherData.map((forecast, index) => {
        // 天気情報に応じてクラスを動的に決定
        const morningClass = getWeatherClass(forecast.morning);
        const afternoonClass = getWeatherClass(forecast.afternoon);

        return (
          <div className="weather-card fade-in" key={index}>
            <div className="date">{forecast.date}</div>
            <div className="weather-details">
              <div className={`morning ${morningClass}`}>
                <div className="time-label">午前</div>
                <i className={`weather-icon fa fa-sun`}></i>
                <div>{forecast.morning}</div>
              </div>
              <div className={`afternoon ${afternoonClass}`}>
                <div className="time-label">午後</div>
                <i className={`weather-icon fa fa-cloud`}></i>
                <div>{forecast.afternoon}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 天気に基づいてクラスを決定する関数
const getWeatherClass = (weather: string): string => {
  switch (weather) {
    case '晴れ':
      return 'sunny';
    case '曇り':
      return 'cloudy';
    case '雨':
      return 'rainy';
    case '雪':
      return 'snowy';
    case '霧':
      return 'mist';
    default:
      return '';
  }
};

export default WeatherForecast;
