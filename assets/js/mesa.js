/** Table ordering page: mesa.html?mesa=4. Uses the same menu-data.js as the site. */

import { el } from "./dom.js?v=20261109";
import {
  STATUSES,
  addOrder,
  formatClock,
  formatEuro,
  getActiveOrderId,
  getOrder,
  itemCountLabel,
  onOrdersChange,
  setActiveOrderId,
  summarise,
  totalLabel,
} from "./orders.js?v=20261109";
import { site } from "./site.js?v=20261109";

const ALL = "todos";

const table = Number(new URLSearchParams(location.search).get("mesa"));
const isValidTable = Number.isInteger(table) && table >= 1 && table <= site.ordering.tables;

const categories = window.OQD_MENU.categories
  .map((group) => ({ ...group, dishes: group.dishes.filter((dish) => dish.orderable) }))
  .filter((group) => group.dishes.length > 0);

const query = (selector) => document.querySelector(selector);

const menuScreen = query("[data-menu-screen]");
const statusScreen = query("[data-status-screen]");
const statusLive = query("[data-status-live]");
const cartBar = query("[data-cart-bar]");
const confirmSheet = query("[data-confirm]");

/** Every orderable dish, with its quantity, note and on-screen controls. */
const lines = new Map();

const selectedItems = () =>
  [...lines.values()]
    .filter((line) => line.qty > 0)
    .map(({ dish, qty, noteInput }) => ({
      id: dish.id,
      name: dish.name,
      qty,
      price: dish.price,
      note: noteInput.value.trim(),
    }));

function priceLabel(dish) {
  if (dish.price == null) return "—";
  return dish.priceIsIndicative ? `${formatEuro(dish.price)} (indicativo)` : formatEuro(dish.price);
}

const lineTotal = (item) => (item.price == null ? "—" : formatEuro(item.price * item.qty));

function updateCartBar() {
  const summary = summarise(selectedItems());
  cartBar.hidden = summary.count === 0 || !statusScreen.hidden;
  query("[data-cart-count]").textContent = itemCountLabel(summary.count);
  query("[data-cart-total]").textContent = totalLabel(summary);
}

function changeQuantity(line, delta) {
  line.qty = Math.max(0, line.qty + delta);
  line.value.textContent = line.qty;
  line.noteRow.hidden = line.qty === 0;
  if (line.qty === 0) {
    line.noteInput.value = "";
    if (document.activeElement === line.minus) line.plus.focus();
  }
  line.minus.disabled = line.qty === 0;
  updateCartBar();
}

function orderRow(dish) {
  const noteId = `nota-${dish.id}`;
  const line = {
    dish,
    qty: 0,
    value: el("output", { class: "stepper__value", "aria-live": "polite", text: "0" }),
    minus: el("button", { type: "button", class: "stepper__button", "aria-label": `Retirar um: ${dish.name}`, disabled: true, text: "−" }),
    plus: el("button", { type: "button", class: "stepper__button", "aria-label": `Adicionar um: ${dish.name}`, text: "+" }),
    noteInput: el("input", { class: "input", id: noteId, type: "text", maxlength: "60", autocomplete: "off", placeholder: "Por exemplo, sem cebola" }),
  };

  line.noteRow = el(
    "div",
    { class: "order-item__note field", hidden: true },
    el("label", { for: noteId, text: `Nota para ${dish.name} (opcional)` }),
    line.noteInput,
  );

  line.minus.addEventListener("click", () => changeQuantity(line, -1));
  line.plus.addEventListener("click", () => changeQuantity(line, 1));
  lines.set(dish.id, line);

  return el(
    "li",
    { class: "order-item" },
    el(
      "div",
      {},
      el("p", { class: "order-item__name", text: dish.name }),
      el("p", { class: "order-item__price", text: priceLabel(dish) }),
    ),
    el("div", { class: "stepper" }, line.minus, line.value, line.plus),
    line.noteRow,
  );
}

function buildMenu() {
  const groups = categories.map((group) => ({
    id: group.id,
    node: el(
      "section",
      { class: "order-group" },
      el("h2", { class: "order-group__title", text: group.name }),
      el("ul", { class: "order-list" }, ...group.dishes.map(orderRow)),
    ),
  }));

  query("[data-order-groups]").replaceChildren(...groups.map((group) => group.node));

  const chips = [{ id: ALL, name: "Todos" }, ...categories].map((group) =>
    el("button", {
      type: "button",
      class: "chip-btn",
      "aria-pressed": String(group.id === ALL),
      text: group.name,
      onclick: (event) => {
        chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip === event.currentTarget)));
        groups.forEach(({ id, node }) => {
          node.hidden = group.id !== ALL && id !== group.id;
        });
        window.scrollTo(0, 0);
      },
    }),
  );

  query("[data-order-chips]").replaceChildren(...chips);
}

function itemsSummary(items) {
  return el(
    "ul",
    { class: "summary-list" },
    ...items.map((item) =>
      el(
        "li",
        { class: "summary-list__row" },
        el(
          "div",
          {},
          el("p", { text: `${item.qty} x ${item.name}` }),
          item.note ? el("p", { class: "summary-list__note", text: item.note }) : null,
        ),
        el("p", { class: "summary-list__price", text: lineTotal(item) }),
      ),
    ),
  );
}

function openConfirmation() {
  const items = selectedItems();
  query("[data-confirm-list]").replaceChildren(itemsSummary(items));
  query("[data-confirm-total]").textContent = totalLabel(summarise(items));
  confirmSheet.showModal();
}

function resetCart() {
  lines.forEach((line) => {
    line.qty = 0;
    line.value.textContent = "0";
    line.minus.disabled = true;
    line.noteInput.value = "";
    line.noteRow.hidden = true;
  });
}

function sendOrder() {
  const order = addOrder({ table, items: selectedItems() });
  setActiveOrderId(table, order.id);
  confirmSheet.close();
  resetCart();
  render();
  window.scrollTo(0, 0);
  statusScreen.querySelector("h2").focus();
}

function showKitchen(event) {
  // Inside the combined demo, ask the parent page to switch screens instead.
  if (window !== window.top) {
    event.preventDefault();
    window.parent.postMessage("oqd-show-kitchen", location.origin);
  }
}

function renderStatus(order) {
  const currentStep = STATUSES.findIndex((status) => status.id === order.status);

  statusScreen.replaceChildren(
    el("h2", { class: "status-title", tabindex: "-1", text: `Pedido n.º ${order.number} enviado` }),
    el("p", { class: "text-muted", text: `Mesa ${order.table} · ${formatClock(order.createdAt)}` }),
    el(
      "ol",
      { class: "tracker" },
      ...STATUSES.map((status, step) =>
        el(
          "li",
          {
            class: `tracker__step${step < currentStep ? " is-done" : ""}${step === currentStep ? " is-current" : ""}`,
            "aria-current": step === currentStep ? "step" : null,
          },
          el("span", { class: "tracker__dot", "aria-hidden": "true" }),
          status.label,
        ),
      ),
    ),
    el("p", { text: STATUSES[currentStep].hint }),
    itemsSummary(order.items),
    el(
      "p",
      { class: "summary-total" },
      el("span", { text: "Total" }),
      el("span", {}, totalLabel(summarise(order.items)), el("small", { text: " valor indicativo" })),
    ),
    el(
      "div",
      { class: "status-actions" },
      el("a", { class: "btn btn--secondary", href: "cozinha.html", text: "Ver na cozinha", onclick: showKitchen }),
      el("button", {
        type: "button",
        class: "btn btn--primary",
        text: "Pedir mais",
        onclick: () => {
          setActiveOrderId(table, null);
          render();
          window.scrollTo(0, 0);
        },
      }),
    ),
  );

  const announcement = `Estado do pedido: ${STATUSES[currentStep].label}`;
  if (statusLive.textContent !== announcement) statusLive.textContent = announcement;
}

function render() {
  const order = getOrder(getActiveOrderId(table));
  menuScreen.hidden = Boolean(order);
  statusScreen.hidden = !order;
  if (order) renderStatus(order);
  updateCartBar();
}

if (isValidTable) {
  const title = `Mesa ${table} · ${site.name}`;
  document.title = title;
  query("[data-table-title]").textContent = title;

  buildMenu();
  query("[data-cart-send]").addEventListener("click", openConfirmation);
  query("[data-confirm-send]").addEventListener("click", sendOrder);
  query("[data-confirm-back]").addEventListener("click", () => confirmSheet.close());
  onOrdersChange(render);
  render();
} else {
  menuScreen.hidden = true;
  query("[data-invalid-screen]").hidden = false;
}
