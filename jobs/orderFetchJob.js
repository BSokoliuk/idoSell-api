import cron from "node-cron";
import { fetchAndSaveOrders } from "../ordersService.js";

export function startOrderFetchJob() {
  cron.schedule("0 3 * * *", async () => {
    // Runs every day at 3:00 AM
    console.log("Scheduled fetchAndSaveOrders running...");
    await fetchAndSaveOrders();
  });
}
