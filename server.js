import express from "express";
import { startOrderFetchJob } from "./jobs/orderFetchJob.js";
import auth from "./middleware/auth.js";
import orders from "./routes/orders.js";

const port = process.env.PORT || 5000;

const app = express();

// Start cron job
startOrderFetchJob();

// Routes
app.use("/api/orders", auth, orders);

app.listen(port, () => console.log(`Server is running on port ${port}`));
