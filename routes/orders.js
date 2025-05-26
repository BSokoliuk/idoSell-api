import express from "express";
import {
  getFilteredOrders,
  getOrderById,
  getOrdersCsv,
} from "../ordersService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const minWorth = parseFloat(req.query.minWorth) || 0;
  const maxWorth = parseFloat(req.query.maxWorth) || Infinity;
  res.json(getFilteredOrders(minWorth, maxWorth));
});

router.get("/:orderID", (req, res) => {
  const orderID = req.params.orderID;
  const order = getOrderById(orderID);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: `Order with id '${orderID}' not found` });
  }
});

router.get("/export/csv", (req, res) => {
  const minWorth = parseFloat(req.query.minWorth) || 0;
  const maxWorth = parseFloat(req.query.maxWorth) || Infinity;
  const csvContent = getOrdersCsv(minWorth, maxWorth);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
  res.send(csvContent);
});

export default router;
