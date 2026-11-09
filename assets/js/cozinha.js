/** Kitchen screen: live orders, status buttons, alerts and the 80 mm ticket. */

import { el } from "./dom.js?v=20261109";
import { STATUSES, clearOrders, formatClock, getOrders, onOrdersChange, setOrderStatus } from "./orders.js?v=20261109";
import { site } from "./site.js?v=20261109";

const PX_PER_MM = 96 / 25.4;
const ALERT_DURATION = 6000;

const query = (selector) => document.querySelector(selector);

const ordersRoot = query("[data-orders]");
const emptyState = query("[data-empty]");
const alertBar = query("[data-alert]");
const paper = query("[data-paper]");
const printRoot = query("[data-print-root]");
const pageStyle = query("[data-page-style]");
const soundButton = query("[data-sound]");

// Orders already here when the page opens shouldn't set off the alert.
const seen = new Set(getOrders().map((order) => order.id));

let highlightedId = null;
let previewId = null;
let alertTimer;

/* Sound. Browsers only allow audio after a tap on the page. */
let audio;
let muted = false;

function unlockAudio() {
  audio ??= new AudioContext();
  audio.resume();
}

function beep() {
  if (muted || !audio) return;
  [0, 0.2].forEach((offset) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + offset;
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.16);
  });
}

document.addEventListener("pointerdown", unlockAudio, { once: true });

soundButton.addEventListener("click", () => {
  muted = !muted;
  soundButton.textContent = muted ? "Som desligado" : "Som ligado";
});

/* The ticket, shared by the on-screen preview and the printer. */
function ticketNode(order) {
  return el(
    "div",
    { class: "ticket" },
    el("p", { class: "ticket__table", text: `MESA ${order.table}` }),
    el(
      "p",
      { class: "ticket__meta" },
      el("span", { text: `Pedido n.º ${order.number}` }),
      el("span", { text: formatClock(order.createdAt) }),
    ),
    el("hr", { class: "ticket__rule" }),
    el(
      "ul",
      { class: "ticket__items" },
      ...order.items.map((item) =>
        el(
          "li",
          {},
          el("p", { text: `${item.qty} x ${item.name}` }),
          item.note ? el("p", { class: "ticket__note", text: `>> ${item.note}` }) : null,
        ),
      ),
    ),
    el("hr", { class: "ticket__rule" }),
    el("p", { class: "ticket__footer", text: `${site.name} · ${site.address.street}` }),
    el("p", { class: "ticket__footer", text: "*** DEMONSTRAÇÃO ***" }),
  );
}

function showTicket(order, animate) {
  previewId = order.id;
  const ticket = ticketNode(order);
  if (animate) ticket.classList.add("ticket--printing");
  paper.replaceChildren(ticket);
}

function printTicket(order) {
  showTicket(order, false);
  printRoot.replaceChildren(ticketNode(order));
  const height = Math.ceil(printRoot.getBoundingClientRect().height / PX_PER_MM) + 6;
  pageStyle.textContent = `@page { size: 80mm ${height}mm; margin: 0; }`;
  window.print();
}

/* Order cards */
function actionButton(order, action, label, disabled, onclick) {
  return el("button", {
    type: "button",
    class: `btn btn--compact ${action === "print" ? "btn--ghost" : "btn--secondary"}`,
    "data-focus-key": `${order.id}:${action}`,
    disabled,
    text: label,
    onclick,
  });
}

function updateStatus(order, status) {
  if (highlightedId === order.id) highlightedId = null;
  setOrderStatus(order.id, status);
  render();
}

function orderCard(order) {
  const status = STATUSES.find((entry) => entry.id === order.status);

  return el(
    "article",
    { class: `order-card${order.id === highlightedId ? " is-new" : ""}` },
    el(
      "div",
      { class: "order-card__head" },
      el("h2", { class: "order-card__table", text: `Mesa ${order.table}` }),
      el("p", { class: "order-card__time", text: formatClock(order.createdAt) }),
    ),
    el(
      "p",
      { class: "order-card__meta" },
      el("span", { text: `Pedido n.º ${order.number}` }),
      el("span", { class: `status-pill status-pill--${order.status}`, text: status.label }),
    ),
    el(
      "ul",
      { class: "order-card__items" },
      ...order.items.map((item) =>
        el(
          "li",
          {},
          el("p", { text: `${item.qty} x ${item.name}` }),
          item.note ? el("p", { class: "order-card__note", text: item.note }) : null,
        ),
      ),
    ),
    el(
      "div",
      { class: "order-card__actions" },
      actionButton(order, "preparing", "Em preparação", order.status !== "recebido", () => updateStatus(order, "preparacao")),
      actionButton(order, "ready", "Pronto", order.status === "pronto", () => updateStatus(order, "pronto")),
      actionButton(order, "print", "Imprimir talão", false, () => printTicket(order)),
    ),
  );
}

function announce(order) {
  highlightedId = order.id;
  alertBar.textContent = `Novo pedido: mesa ${order.table}`;
  alertBar.hidden = false;
  clearTimeout(alertTimer);
  alertTimer = setTimeout(() => {
    alertBar.hidden = true;
  }, ALERT_DURATION);
  beep();
}

function render() {
  const orders = getOrders().sort(
    (a, b) => (a.status === "pronto") - (b.status === "pronto") || b.number - a.number,
  );

  const newest = orders.filter((order) => !seen.has(order.id)).sort((a, b) => b.number - a.number)[0];
  orders.forEach((order) => seen.add(order.id));

  if (newest) {
    announce(newest);
    showTicket(newest, true);
  } else if (!orders.some((order) => order.id === previewId)) {
    if (orders[0]) showTicket(orders[0], false);
    else {
      previewId = null;
      paper.replaceChildren(el("p", { class: "printer__idle", text: "À espera de pedidos" }));
    }
  }

  // Rebuilding the cards would otherwise drop keyboard focus.
  const focusKey = document.activeElement?.dataset?.focusKey;
  ordersRoot.replaceChildren(...orders.map(orderCard));
  if (focusKey) {
    const button = ordersRoot.querySelector(`[data-focus-key="${focusKey}"]`);
    const card = button?.closest(".order-card");
    (button?.disabled ? card.querySelector("button:not([disabled])") : button)?.focus();
  }

  emptyState.hidden = orders.length > 0;

  const waiting = orders.filter((order) => order.status === "recebido").length;
  query("[data-waiting]").textContent =
    waiting === 0 ? "Sem pedidos por iniciar" : `${waiting} por iniciar`;
  document.title = `${waiting > 0 ? `(${waiting}) ` : ""}Cozinha · ${site.name}`;
}

query("[data-clear]").addEventListener("click", () => {
  clearOrders();
  seen.clear();
  highlightedId = null;
  alertBar.hidden = true;
  render();
});

onOrdersChange(render);
render();
