import express from "express";
import dotenv from "dotenv";
import { replyMessage } from "./line.js";
import { addStock, removeStock, loadStocks } from "./stockStore.js";
import { startStockChecker } from "./stockChecker.js";

dotenv.config();

const app = express();
app.use(express.json());

// LINE Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const events = req.body.events;
    if (!events || events.length === 0) return res.sendStatus(200);

    for (const event of events) {
      if (event.type !== "message") continue;
      if (event.message.type !== "text") continue;

      const text = event.message.text.trim();
      const replyToken = event.replyToken;

      // 指令：list
      if (text === "list") {
        const stocks = loadStocks();
        if (stocks.length === 0) {
          await replyMessage(replyToken, "目前沒有追蹤任何股票");
        } else {
          const msg = stocks
            .map((s) => `📌 ${s.symbol} 目標價 ${s.target}`)
            .join("\n");
          await replyMessage(replyToken, msg);
        }
        continue;
      }

      // 指令：add TSLA 200
      if (text.startsWith("add ")) {
        const parts = text.split(" ");
        if (parts.length !== 3) {
          await replyMessage(replyToken, "格式錯誤，用法：add TSLA 200");
          continue;
        }

        const symbol = parts[1];
        const target = Number(parts[2]);

        if (isNaN(target)) {
          await replyMessage(replyToken, "目標價必須是數字");
          continue;
        }

        addStock(symbol, target);
        await replyMessage(
          replyToken,
          `已新增/更新：${symbol} 目標價 ${target}`,
        );
        continue;
      }

      // 指令：remove TSLA
      if (text.startsWith("remove ")) {
        const parts = text.split(" ");
        if (parts.length !== 2) {
          await replyMessage(replyToken, "格式錯誤，用法：remove TSLA");
          continue;
        }

        const symbol = parts[1];
        removeStock(symbol);

        await replyMessage(replyToken, `已移除：${symbol}`);
        continue;
      }

      // help
      await replyMessage(
        replyToken,
        `📌 指令列表：
            add 股票代號 目標價
            remove 股票代號
            list

            範例：
            add TSLA 200
            add 2330.TW 900
            remove TSLA
            list`,
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("LINE Stock Bot running");
});

console.log("📌 Starting LINE Stock Bot...");

// 啟動檢查器
startStockChecker();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
