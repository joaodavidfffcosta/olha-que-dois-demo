/**
 * Demo order store, with no backend: orders live in this browser only.
 * localStorage keeps them across pages and BroadcastChannel syncs open tabs
 * and frames straight away. Two separate devices can't share them; README.md
 * explains the production path.
 */

const ORDERS_KEY = "oqd-demo-orders";
const ACTIVE_KEY_PREFIX = "oqd-demo-active-";

export const STATUSES = Object.freeze([
  { id: "recebido", label: "Recebido", hint: "A equipa já recebeu o seu pedido." },
  { id: "preparacao", label: "Em preparação", hint: "O seu pedido está a ser preparado." },
  { id: "pronto", label: "Pronto", hint: "O seu pedido está pronto." },
]);

const channel = "BroadcastChannel" in window ? new BroadcastChannel("oqd-demo") : null;

// In-memory copies keep the demo working if the browser blocks localStorage.
let memoryOrders = [];
const memoryActive = new Map();

channel?.addEventListener("message", ({ data }) => {
  memoryOrders = data;
});

function readOrders() {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : memoryOrders;
  } catch {
    return memoryOrders;
  }
}

function writeOrders(orders) {
  memoryOrders = orders;
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // The memory copy and the channel still carry the order.
  }
  channel?.postMessage(orders);
}

export const getOrders = () => readOrders();

export const getOrder = (id) => readOrders().find((order) => order.id === id);

export function addOrder({ table, items }) {
  const orders = readOrders();
  const number = orders.reduce((highest, order) => Math.max(highest, order.number), 0) + 1;
  const order = {
    id: `${Date.now()}-${number}`,
    number,
    table,
    items,
    status: "recebido",
    createdAt: new Date().toISOString(),
  };
  writeOrders([...orders, order]);
  return order;
}

export function setOrderStatus(id, status) {
  writeOrders(readOrders().map((order) => (order.id === id ? { ...order, status } : order)));
}

export const clearOrders = () => writeOrders([]);

/** Calls listener when another tab or frame changes the orders. */
export function onOrdersChange(listener) {
  channel?.addEventListener("message", () => listener());
  window.addEventListener("storage", (event) => {
    if (event.key === ORDERS_KEY || event.key === null) listener();
  });
}

export function getActiveOrderId(table) {
  try {
    return localStorage.getItem(ACTIVE_KEY_PREFIX + table) ?? memoryActive.get(table) ?? null;
  } catch {
    return memoryActive.get(table) ?? null;
  }
}

export function setActiveOrderId(table, id) {
  memoryActive.set(table, id);
  try {
    if (id) localStorage.setItem(ACTIVE_KEY_PREFIX + table, id);
    else localStorage.removeItem(ACTIVE_KEY_PREFIX + table);
  } catch {
    // The memory copy is enough for this page.
  }
}

const euro = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

export const formatEuro = (value) => euro.format(value);

const lisbonClock = new Intl.DateTimeFormat("pt-PT", {
  timeZone: "Europe/Lisbon",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export const formatClock = (iso) => lisbonClock.format(new Date(iso)).replace(":", "h");

export const itemCountLabel = (count) => `${count} ${count === 1 ? "artigo" : "artigos"}`;

/** Totals only the items that have a price, and counts the ones that don't. */
export function summarise(items) {
  const priced = items.filter((item) => item.price != null);
  return {
    count: items.reduce((sum, item) => sum + item.qty, 0),
    unpriced: items.filter((item) => item.price == null).reduce((sum, item) => sum + item.qty, 0),
    total: priced.length > 0 ? priced.reduce((sum, item) => sum + item.price * item.qty, 0) : null,
  };
}

export function totalLabel({ total, unpriced }) {
  if (total == null) return "—";
  return unpriced > 0 ? `${formatEuro(total)} + ${itemCountLabel(unpriced)} sem preço` : formatEuro(total);
}
