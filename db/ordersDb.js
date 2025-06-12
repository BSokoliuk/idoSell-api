import Database from "better-sqlite3";

const db = new Database("orders.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    orderID TEXT PRIMARY KEY,
    orderWorth REAL
  );
  CREATE TABLE IF NOT EXISTS products (
    orderID TEXT,
    productID INTEGER,
    quantity INTEGER,
    FOREIGN KEY(orderID) REFERENCES orders(orderID)
  );
`);

// upsert single order
function upsertOrder(order) {
  db.prepare(
    "INSERT OR REPLACE INTO orders (orderID, orderWorth) VALUES (?, ?)"
  ).run(order.orderID, order.orderWorth);

  db.prepare("DELETE FROM products WHERE orderID = ?").run(order.orderID);
  for (const product of order.products) {
    db.prepare(
      "INSERT INTO products (orderID, productID, quantity) VALUES (?, ?, ?)"
    ).run(order.orderID, product.productID, product.quantity);
  }
}

// upsert multiple orders
export function upsertOrders(orders) {
  const insert = db.transaction((orders) => {
    for (const order of orders) {
      upsertOrder(order);
    }
  });
  insert(orders);
}

// get orders with optional worth filter
export function getOrders(minWorth = 0, maxWorth = Infinity) {
  const orders = db
    .prepare("SELECT * FROM orders WHERE orderWorth >= ? AND orderWorth <= ?")
    .all(minWorth, maxWorth);

  for (const order of orders) {
    order.products = db
      .prepare("SELECT productID, quantity FROM products WHERE orderID = ?")
      .all(order.orderID);
  }
  return orders;
}

// get single order by ID
export function getOrderById(orderID) {
  const order = db
    .prepare("SELECT * FROM orders WHERE orderID = ?")
    .get(orderID);
  if (!order) return null;
  order.products = db
    .prepare("SELECT productID, quantity FROM products WHERE orderID = ?")
    .all(orderID);
  return order;
}
