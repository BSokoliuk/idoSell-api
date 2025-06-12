import axios from "axios";
import {
  upsertOrders,
  getOrderById as dbGetOrderById,
  getOrders as dbGetOrders,
} from "./db/ordersDb.js";

// Check if environment variables are set
if (!process.env.DOMAIN || !process.env.API_KEY) {
  throw new Error("Environment variables DOMAIN and API_KEY must be set.");
}

const apiDomain = process.env.DOMAIN;
const apiKey = process.env.API_KEY;
const apiUrl = `https://${apiDomain}/api/admin/v5/orders/orders/search`;

function mapApiOrders(apiOrders) {
  return apiOrders.map((order) => ({
    orderID: order.orderId,
    products: (order.orderDetails.productsResults || []).map((product) => ({
      productID: product.productId,
      quantity: product.productQuantity,
    })),
    orderWorth: order.orderDetails.payments.orderCurrency.orderProductsCost,
  }));
}

async function fetchOrdersPage(page, resultsLimit) {
  try {
    const response = await axios.post(
      apiUrl,
      { params: { resultPage: page, resultsLimit } },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      }
    );
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 429) {
      console.log("Rate limit exceeded, waiting for 10 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return fetchOrdersPage(page, resultsLimit); // retry
    }
    console.error(`Error fetching page ${page}:`, err.message);
    return null;
  }
}

export async function fetchAndSaveOrders() {
  const resultsLimit = 100;
  let page = 0;
  let totalPages = 1;

  do {
    const data = await fetchOrdersPage(page, resultsLimit);
    if (data && data.Results) {
      const mappedOrders = mapApiOrders(data.Results);
      try {
        upsertOrders(mappedOrders);
      } catch (dbErr) {
        console.error(`DB error on page ${page}:`, dbErr.message);
      }
      if (page === 0) {
        const total = data.resultsNumberAll || 0;
        totalPages = Math.ceil(total / resultsLimit);
      }
    } else if (data === null) {
      // Already logged in fetchOrdersPage, skip this page
    } else {
      // Unexpected result, break the loop
      break;
    }
    page++;
  } while (page < totalPages);

  console.log(`Fetched and saved orders from ${page} pages.`);
}

export function getOrderById(orderId) {
  return dbGetOrderById(orderId);
}

export function getFilteredOrders(minWorth = 0, maxWorth = Infinity) {
  return dbGetOrders(minWorth, maxWorth);
}

export function getOrdersCsv(minWorth = 0, maxWorth = Infinity) {
  const filtered = getFilteredOrders(minWorth, maxWorth);
  const csvRows = [
    "Order ID,Product ID,Quantity,Order Worth",
    ...filtered.flatMap((order) =>
      order.products.map(
        (product) =>
          `${order.orderID},${product.productID},${product.quantity},${order.orderWorth}`
      )
    ),
  ];
  return csvRows.join("\n");
}
