import fs from "fs";

const ORDERS_FILE = "./orders.json";

export function saveOrdersToFile() {
  fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), (err) => {
    if (err) {
      console.error("Error saving orders to file:", err);
    }
  });
}

export function loadOrdersFromFile() {
  if (fs.existsSync(ORDERS_FILE)) {
    const data = fs.readFileSync(ORDERS_FILE, "utf8");
    if (data.trim().length === 0) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error("Error parsing orders from file:", err);
      return [];
    }
  }
  return [];
}
