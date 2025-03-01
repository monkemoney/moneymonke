require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Redis = require('redis');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const axiosRetry = require('axios-retry').default;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL, credentials: true } });

const PORT = process.env.PORT || 10000;
const CACHE_TTL = 600; // 10 דקות
const ALERT_TTL = 86400; // 24 שעות
const PRICE_UPDATE_INTERVAL = 30000; // 30 שניות

// ✅ CORS - מאובטח ומוגדר נכון
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST"]
}));

// ✅ Cookie Parser לניהול Session Tokens
app.use(cookieParser());

// ✅ ניהול Cookies בהתאם לסביבה (Production/Local)
app.use((req, res, next) => {
  res.cookie("session", "your-session-id", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
  });
  next();
});

// ✅ Rate Limiting למניעת עומס
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "⏳ יותר מדי בקשות! נסה שוב בעוד דקה."
}));

// ✅ axiosRetry לקריאות API יציבות
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// ✅ חיבור ל-Redis עם טיפול בנפילות
const redisClient = Redis.createClient({
  socket: { url: process.env.REDIS_URL || 'redis://localhost:6379' }
});

redisClient.on('error', (err) => console.error(`❌ Redis Error: ${err.message}`));

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis מחובר בהצלחה!');
  } catch (err) {
    console.error('❌ שגיאה בחיבור ל-Redis:', err.message);
  }
})();

app.use(express.json());

// ✅ פונקציה לשליפת נתונים עם Redis Cache + מנגנון fallback
const fetchData = async (key, url, headers = {}) => {
  try {
    if (!redisClient.isReady) {
      console.warn("⚠ Redis לא מחובר – משתמשים בקריאה ישירה ל-API.");
      return (await axios.get(url, { headers })).data;
    }

    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log(`📌 Redis Cache Hit: ${key}`);
      return JSON.parse(cachedData);
    }

    const response = await axios.get(url, { headers });

    console.log(`📌 Redis Save: ${key}`);
    await redisClient.setEx(key, CACHE_TTL, JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    console.error(`❌ API Error (${key}): ${error.message}`);
    return null;
  }
};

// ✅ ניהול חיבורים ב-WebSockets
const connectedUsers = new Map();

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    for (const [user, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(user);
        break;
      }
    }
  });
});

// ✅ קריאות API (תוקן – שימוש בכתובות ישירות)
app.get('/api/cryptocompare/:symbol', async (req, res) => {
  const { symbol } = req.params;
  console.log(`📌 API Request: CryptoCompare for ${symbol}`);
  const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;

  const data = await fetchData(`cryptocompare:${symbol}`, url);
  data ? res.json(data) : res.status(500).json({ error: "API Request Failed" });
});

app.get('/api/price/:symbol', async (req, res) => {
  const { symbol } = req.params;
  console.log(`📌 API Request: CoinMarketCap for ${symbol}`);
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`;

  const data = await fetchData(`price:${symbol}`, url, {
    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
  });

  data ? res.json(data) : res.status(500).json({ error: "API Request Failed" });
});

app.get('/api/lunar/:symbol', async (req, res) => {
  const { symbol } = req.params;
  console.log(`📌 API Request: LunarCrush for ${symbol}`);
  const url = `https://api.lunarcrush.com/v2?data=assets&symbol=${symbol}&key=${process.env.LUNARCRUSH_API_KEY}`;

  const data = await fetchData(`lunar:${symbol}`, url);
  data ? res.json(data) : res.status(500).json({ error: "API Request Failed" });
});

// ✅ Solscan API (תוקן – בדיקה אם מפתח בתוקף)
app.get('/api/contract/sol/:contractAddress', async (req, res) => {
  const { contractAddress } = req.params;
  console.log(`📌 API Request: Solscan for ${contractAddress}`);
  const url = `https://pro-api.solscan.io/v2.0/account/${contractAddress}`;

  try {
    const response = await axios.get(url, {
      headers: { 'accept': 'application/json', 'token': process.env.SOLSCAN_API_KEY }
    });

    if (response.status !== 200) {
      return res.status(500).json({ error: "Solscan API Request Failed - בדוק אם המפתח שלך בתוקף!" });
    }

    res.json({ contractAddress, data: response.data });
  } catch (error) {
    console.error(`❌ Solscan API Error: ${error.message}`);
    res.status(500).json({ error: "Solscan API Request Failed" });
  }
});

// ✅ בדיקת חיבור שרת
app.get("/", (req, res) => {
  res.send("✅ Server is running on api.moneymonke.io!");
});

// ✅ הפעלת השרת
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on https://api.moneymonke.io (PORT ${PORT})`);
});