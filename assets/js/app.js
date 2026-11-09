/**
 * Site entry point. Fills the page from window.OQD_SITE (site-data.js) and
 * loads the home page's extra features when they're needed.
 *
 * Markup hooks:
 *   data-text="path"    sets the element's text
 *   data-href="path"    sets the element's href
 *   data-if="path"      shows the element only when the value is truthy
 *   data-unless="path"  hides the element when the value is truthy
 *   data-hours-summary  renders the grouped opening hours into a list
 */

import { formatTime } from "./hours.js?v=20261109";
import { read, site } from "./site.js?v=20261109";

function bindData() {
  document.querySelectorAll("[data-text]").forEach((el) => {
    const value = read(el.dataset.text);
    if (value != null) el.textContent = value;
  });

  document.querySelectorAll("[data-href]").forEach((el) => {
    const value = read(el.dataset.href);
    if (value != null) el.setAttribute("href", value);
  });

  document.querySelectorAll("[data-if]").forEach((el) => {
    el.hidden = !read(el.dataset.if);
  });

  document.querySelectorAll("[data-unless]").forEach((el) => {
    el.hidden = Boolean(read(el.dataset.unless));
  });
}

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** Groups consecutive days that share hours, with unknown days listed last. */
function groupHours(hours) {
  const groups = [];

  for (const day of hours) {
    const key = day.open ? `${day.open}-${day.close}` : "unknown";
    const last = groups.at(-1);
    if (last?.key === key) last.days.push(day);
    else groups.push({ key, days: [day] });
  }

  return groups.sort((a, b) => (a.key === "unknown") - (b.key === "unknown"));
}

function hoursRow({ key, days }) {
  const first = days[0];
  const last = days.at(-1);

  const row = document.createElement("li");
  row.className = "hours-summary__row";

  const label = document.createElement("span");
  label.textContent = capitalise(days.length === 1 ? first.short : `${first.short} a ${last.short}`);

  const time = document.createElement("span");
  if (key === "unknown") {
    time.className = "ph";
    time.textContent = "[CONFIRMAR]";
  } else {
    time.className = "hours-summary__time";
    time.textContent = `${formatTime(first.open)} às ${formatTime(first.close)}`;
  }

  row.append(label, time);
  return row;
}

function renderHoursSummary() {
  const rows = groupHours(site.hours);
  document.querySelectorAll("[data-hours-summary]").forEach((list) => {
    list.replaceChildren(...rows.map(hoursRow));
  });
}

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const label = toggle.querySelector("[data-nav-label]");
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Fechar" : "Menu";
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (isOpen() && !event.target.closest(".site-header")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
}

bindData();
renderHoursSummary();
initNavigation();

if (document.getElementById("ementa")) import("./home.js?v=20261109");
