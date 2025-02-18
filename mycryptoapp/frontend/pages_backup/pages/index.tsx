import { useEffect, useState } from "react";
import axios from "axios";

interface CryptoData {
  price: number;
  market_cap: number;
  volume_24h: number;
}

export default function Home() {
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://api.moneymonke.io/api/price/BTC")
      .then((res) => {
        setData(res.data.data.BTC.quote.USD);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Bitcoin Price</h1>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : data ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-xl font-semibold">Price: ${data.price.toLocaleString()}</p>
          <p className="text-lg">Market Cap: ${data.market_cap.toLocaleString()}</p>
          <p className="text-lg">24h Volume: ${data.volume_24h.toLocaleString()}</p>
        </div>
      ) : (
        <p className="text-red-500">Failed to load data.</p>
      )}
    </div>
  );
}