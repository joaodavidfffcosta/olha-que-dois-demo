/**
 * Combined demo: the table and the kitchen on one device.
 * Side by side on a laptop, with a Mesa/Cozinha switch on a phone.
 */

import { getOrders, onOrdersChange } from "./orders.js?v=20261109";

const root = document.querySelector("[data-demo]");
const buttons = [...document.querySelectorAll("[data-view]")];
const badge = document.querySelector("[data-badge]");
const sideBySide = window.matchMedia("(min-width: 960px)");

let ordersSeen = getOrders().length;

function show(view) {
  root.dataset.current = view;
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.view === view)));
  if (view === "cozinha") {
    ordersSeen = getOrders().length;
    badge.hidden = true;
  }
}

buttons.forEach((button) => button.addEventListener("click", () => show(button.dataset.view)));

onOrdersChange(() => {
  const total = getOrders().length;
  const unseen = total - ordersSeen;

  if (unseen > 0 && root.dataset.current !== "cozinha" && !sideBySide.matches) {
    badge.textContent = unseen;
    badge.hidden = false;
  } else {
    ordersSeen = total;
    badge.hidden = true;
  }
});

// The table page's "Ver na cozinha" button asks for this.
window.addEventListener("message", (event) => {
  if (event.origin === location.origin && event.data === "oqd-show-kitchen") show("cozinha");
});
