import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:10000";

// ✅ קריאה ל-CryptoCompare API
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

// ✅ קריאה ל-CoinMarketCap API
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

// ✅ קריאה ל-LunarCrush API
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

// ✅ קריאה ל-Blockdaemon API
export const fetchBlockdaemonContract = async (contractAddress: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_BLOCKDAEMON_API_KEY;
    if (!apiKey) throw new Error("BLOCKDAEMON_API_KEY is missing!");

    const res = await axios.get(`${API_BASE_URL}/api/solana-holders`, {
      params: { address: contractAddress },
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    console.log("📩 Blockdaemon Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching Blockdaemon contract data:", error);
    return null;
  }
};

// ✅ קריאה ל-Etherscan API
export const fetchEtherscanContract = async (contractAddress: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    if (!apiKey) throw new Error("ETHERSCAN_API_KEY is missing!");

    const res = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: "contract",
        action: "getabi",
        address: contractAddress,
        apikey: apiKey
      }
    });

    console.log("📩 Etherscan Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching Etherscan contract data:", error);
    return null;
  }
};

// ✅ WebSocket URL
export const getWebSocketURL = () => {
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:10000";
};