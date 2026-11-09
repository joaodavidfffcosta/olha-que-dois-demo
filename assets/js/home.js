/** Home page features: live hours, FAQ, menu, gallery, contact tools, schema. */

import { initContact } from "./contact.js?v=20261109";
import { el, textOrTag } from "./dom.js?v=20261109";
import { initGallery } from "./gallery.js?v=20261109";
import { formatTime, lisbonClock, openStatus } from "./hours.js?v=20261109";
import { initDailySpecials, initMenu } from "./menu.js?v=20261109";
import { injectStructuredData } from "./schema.js?v=20261109";
import { fillFacts, links, site } from "./site.js?v=20261109";

function renderOpenBadge() {
  const badge = document.querySelector("[data-open-badge]");

  const update = () => {
    const { state, label } = openStatus(site.hours, lisbonClock());
    badge.className = `badge badge--${state} js-only`;
    badge.textContent = label;
  };

  update();
  setInterval(update, 60_000);
}

function renderHoursTable() {
  const { day: today } = lisbonClock();

  document.querySelector("[data-hours-table]").replaceChildren(
    ...site.hours.map((entry) => {
      const isToday = entry.day === today;
      return el(
        "tr",
        { class: isToday ? "is-today" : null, "aria-current": isToday ? "date" : null },
        el("th", { scope: "row" }, entry.name, isToday ? el("span", { class: "hours-table__today", text: "Hoje" }) : null),
        el(
          "td",
          {},
          entry.open
            ? `${formatTime(entry.open)} às ${formatTime(entry.close)}`
            : el("span", { class: "ph", text: "[CONFIRMAR]" }),
        ),
      );
    }),
  );
}

function renderFaq() {
  document.querySelector("[data-faq-list]").replaceChildren(
    ...site.faq.map((item) =>
      el(
        "details",
        { class: "faq__item" },
        el("summary", { text: item.question }),
        el("p", { class: "faq__answer" }, fillFacts(item.answer), item.note ? " " : null, item.note ? textOrTag(item.note) : null),
      ),
    ),
  );
}

renderOpenBadge();
renderHoursTable();
renderFaq();
initDailySpecials(window.OQD_MENU, site);
initMenu(window.OQD_MENU, links);
initGallery(site.gallery);
initContact(site, links);
injectStructuredData(site);
