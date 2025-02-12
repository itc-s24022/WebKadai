import React from 'react';
import './globals.css'; // グローバルスタイルをインポート

export const metadata = {
  title: 'Weather App',
  description: '天気予報アプリ',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <head>
        {/* メタデータやその他の必要なタグを追加 */}
      </head>
      <body>
        <div className="layout-container">
          <header>
            <h1>天気予報アプリ</h1>
          </header>
          <main>{children}</main>
          <footer>2025 © WeatherApp</footer>
        </div>
      </body>
    </html>
  );
};

export default Layout;
