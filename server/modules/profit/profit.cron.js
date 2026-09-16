import cron from "node-cron";
import { runProfitEngine } from "./profit.engine.js";

export const registerProfitCron = () => {
  // Profit & Completion Check — Runs every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Profit engine and completion check started (Hourly)");
    await runProfitEngine();
  });
};