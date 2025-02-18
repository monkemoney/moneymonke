"use client"; // 🟢 חייב להיות בראש הקובץ כדי להשתמש ב- useState/useEffect

import { useState, useEffect } from "react";

export default function HomePage() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // 🟢 משתמש ב- .env.local
      console.log("🟡 Fetching from:", backendUrl);

      try {
        const response = await fetch(`${backendUrl}/api/price/BTC`);
        if (!response.ok) {
          console.error("❌ API Error:", response.status);
          return;
        }

        const data = await response.json();
        console.log("📩 Response from API:", data);

        if (data?.data?.BTC?.quote?.USD?.price) {
          setPrice(data.data.BTC.quote.USD.price);
        }
      } catch (error) {
        console.error("❌ Fetch failed:", error);
      }
    };

    fetchPrice();
  }, []);

  return (
    <div>
      <h1>Welcome to Money Monke!</h1>
      <h2>Bitcoin Price:</h2>
      <p>{price ? `$${price.toFixed(2)}` : "Loading..."}</p>
    </div>
  );
}
console.log("🔑 NEXT_PUBLIC_ETHERSCAN_API_KEY:", process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY);
