import fs from "fs";

// Render 建議掛載 Persistent Disk 到 /data
const FILE = "/data/trackedStocks.json";

export function loadStocks() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
  }
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

export function saveStocks(stocks) {
  fs.writeFileSync(FILE, JSON.stringify(stocks, null, 2));
}

export function addStock(symbol, target) {
  const stocks = loadStocks();

  const exists = stocks.find((s) => s.symbol === symbol);
  if (exists) {
    exists.target = target;
    exists.state = null; // 重設狀態
  } else {
    stocks.push({ symbol, target, state: null });
  }

  saveStocks(stocks);
  return stocks;
}

export function removeStock(symbol) {
  let stocks = loadStocks();
  stocks = stocks.filter((s) => s.symbol !== symbol);
  saveStocks(stocks);
  return stocks;
}
