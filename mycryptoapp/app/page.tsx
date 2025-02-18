"use client";
import { useState, useEffect } from "react";
import PriceChart from "../components/PriceChart";

export default function Home() {
  const [coin, setCoin] = useState("bitcoin");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, [coin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">🔍 בדוק מטבע</h1>
      <input
        type="text"
        placeholder="הכנס שם מטבע (למשל: bitcoin)"
        className="p-2 border border-gray-300 rounded text-black"
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
      />
      {data && data.market_data?.sparkline_7d?.price ? (
        <PriceChart prices={data.market_data.sparkline_7d.price.map((p: number, i: number) => [Date.now() - (7 - i) * 86400000, p])} />
      ) : (
        <p className="mt-4">טוען נתונים...</p>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [coin, setCoin] = useState("bitcoin");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [coin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">🔍 בדוק מטבע</h1>
      <input
        type="text"
        placeholder="הכנס שם מטבע (למשל: bitcoin)"
        className="p-2 border border-gray-300 rounded text-black"
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
      />
      {data ? (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold">{data.name} ({data.symbol.toUpperCase()})</h2>
          <p className="text-lg">💰 מחיר נוכחי: {data.market_data?.current_price?.usd} USD</p>
        </div>
      ) : (
        <p className="mt-4">טוען נתונים...</p>
      )}
    </div>
  );
}