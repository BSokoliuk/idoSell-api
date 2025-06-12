import cron from "node-cron";
import { fetchAndSaveOrders } from "../ordersService.js";

let isFetching = false;

export function startOrderFetchJob() {
  cron.schedule("0 3 * * *", async () => {
    if (isFetching) {
      console.log("Fetch already in progress, skipping this run.");
      return;
    }
    isFetching = true;
    // Runs every day at 3:00 AM
    console.log("Scheduled fetchAndSaveOrders running...");
    try {
      await fetchAndSaveOrders();
    } catch (error) {
      console.error("Error during scheduled fetchAndSaveOrders:", error);
    } finally {
      isFetching = false;
    }
  });
}
