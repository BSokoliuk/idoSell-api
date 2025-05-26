import axios from "axios";
import { saveOrdersToFile, loadOrdersFromFile } from "./ordersStorage.js";

// Check if environment variables are set
if (!process.env.DOMAIN || !process.env.API_KEY) {
  throw new Error("Environment variables DOMAIN and API_KEY must be set.");
}

let orders = loadOrdersFromFile();

const apiDomain = process.env.DOMAIN;
const apiKey = process.env.API_KEY;
const apiUrl = `https://${apiDomain}/api/admin/v5/orders/orders/search`;

export async function fetchAndSaveOrders() {
  try {
    const response = await axios.post(
      apiUrl,
      {
        params: { resultPage: 0, resultsLimit: 100 },
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      }
    );

    if (response.data && response.data.Results) {
      orders = response.data.Results.map((order) => ({
        orderID: order.orderId,
        products: (order.orderDetails.productsResults || []).map((product) => ({
          productID: product.productId,
          quantity: product.productQuantity,
        })),
        orderWorth: order.orderDetails.payments.orderCurrency.orderProductsCost,
      }));
      saveOrdersToFile();
    } else {
      console.error("No orders found in the response.");
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

export function getOrderById(orderId) {
  return orders.find((order) => order.orderID == orderId);
}

export function getFilteredOrders(minWorth = 0, maxWorth = Infinity) {
  return orders.filter(
    (order) => order.orderWorth >= minWorth && order.orderWorth <= maxWorth
  );
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
