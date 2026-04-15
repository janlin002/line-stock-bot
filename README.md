# LINE Stock Bot (Render 部署版)

## 功能
- add 股票代號 目標價
- remove 股票代號
- list
- 每分鐘檢查股票價格
- 突破目標價通知 / 跌破目標價通知
- 避免重複通知（狀態變化才通知）

## 指令範例
```
add TSLA 200
add 2330.TW 900
list
remove TSLA
```

## 本機執行
```bash
npm install
cp .env.example .env
npm start
```

## Render 部署
1. Push 到 GitHub
2. Render 新增 Web Service
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 設定環境變數
   - LINE_CHANNEL_ACCESS_TOKEN
   - LINE_USER_ID
6. 開啟 Persistent Disk
   - Mount Path: `/data`

## LINE Webhook
Webhook URL:
`https://你的render網址.onrender.com/webhook`
