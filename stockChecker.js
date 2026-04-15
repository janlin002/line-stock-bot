import axios from "axios";
import cron from "node-cron";
import { pushMessage } from "./line.js";
import dotenv from "dotenv";

dotenv.config();

const USER_ID = process.env.LINE_USER_ID;

// 只放台股（不要 .TW）
const watchList = ["0050", "0056", "00935", "2330", "2308"];

async function getStockInfo(symbol) {
  try {
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${symbol}.tw`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    console.log("📌 TWSE API response for", symbol, res);

    const data = res?.data.msgArray?.[0];
    if (!data) return null;

    return {
      symbol,
      name: data.n || symbol,
      open: parseFloat(data.o), // 開盤
      prevClose: parseFloat(data.y), // 昨收
      price: parseFloat(data.z), // 現價
    };
  } catch (err) {
    console.error("❌ TWSE API error:", symbol, err.message);
    return null;
  }
}

function getTrend(price, prevClose) {
  if (!price || !prevClose) return "➖ 無資料";
  if (price > prevClose) return "📈 看漲";
  if (price < prevClose) return "📉 看跌";
  return "➖ 持平";
}

export function startStockChecker() {
  // 每小時 09:00 ~ 12:00
  cron.schedule(
    "0 9-12 * * *",
    // "* * * * *",
    async () => {
      console.log("📌 盤中整合報告開始");

      let message = "📊 台股盤中報告\n\n";

      for (const symbol of watchList) {
        const info = await getStockInfo(symbol);

        console.log("📌 股票資訊:", symbol, info);

        if (!info) continue;

        const trend = getTrend(info.price, info.prevClose);

        message +=
          `📌 ${info.name} (${symbol})\n` +
          `開盤：${info.open}\n` +
          `昨收：${info.prevClose}\n` +
          `目前：${info.price}\n` +
          `趨勢：${trend}\n\n`;
      }

      await pushMessage(USER_ID, message);
    },
    { timezone: "Asia/Taipei" },
  );
}
