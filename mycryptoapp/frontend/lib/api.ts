import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:10000";

export const fetchCryptoPrice = async (symbol: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/cryptocompare/${symbol}`, {
      params: { api_key: process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY || "" }
    });
    console.log("📩 CryptoCompare Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching CryptoCompare price:", error);
    return null;
  }
};

export const fetchCoinMarketCapPrice = async (symbol: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/price/${symbol}`, {
      headers: { "X-CMC_PRO_API_KEY": process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY || "" }
    });
    console.log("📩 CoinMarketCap Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching CoinMarketCap price:", error);
    return null;
  }
};

export const fetchLunarCrushData = async (symbol: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/lunar/${symbol}`, {
      params: { key: process.env.NEXT_PUBLIC_LUNARCRUSH_API_KEY || "" }
    });
    console.log("📩 LunarCrush Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching LunarCrush data:", error);
    return null;
  }
};

export const fetchSolscanContract = async (contractAddress: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/contract/sol/${contractAddress}`, {
      headers: { token: process.env.NEXT_PUBLIC_SOLSCAN_API_KEY || "" }
    });
    console.log("📩 Solscan Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching Solscan contract data:", error);
    return null;
  }
};

export const getWebSocketURL = () => {
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:10000";
};