/** Pratos do dia and the searchable menu, both fed by menu-data.js. */

import { el, textOrTag } from "./dom.js?v=20261109";
import { lisbonClock } from "./hours.js?v=20261109";

const ALL = "todos";
const money = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

const normalise = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

function priceLabel(dish) {
  if (dish.price == null) return "Preço a confirmar";
  const price = money.format(dish.price);
  return dish.priceIsIndicative ? `${price} (preço indicativo)` : price;
}

function dishRow(dish) {
  const tags = [...dish.flags, ...dish.allergens];

  return el(
    "li",
    { class: "dish" },
    dish.photo
      ? el("img", { class: "dish__photo", src: dish.photo, alt: "", width: 64, height: 64, loading: "lazy", decoding: "async" })
      : null,
    el(
      "div",
      { class: "dish__body" },
      el(
        "div",
        { class: "dish__line" },
        el("span", { class: "dish__name", text: dish.name }),
        el("span", { class: "dish__dots", "aria-hidden": "true" }),
        el("span", { class: "dish__price", text: priceLabel(dish) }),
      ),
      dish.description ? el("p", { class: "dish__description", text: dish.description }) : null,
      tags.length ? el("p", { class: "dish__tags", text: tags.join(" · ") }) : null,
    ),
  );
}

function resultLabel(total) {
  if (total === 0) return "Nenhum resultado";
  return total === 1 ? "1 resultado" : `${total} resultados`;
}

export function initMenu(menu, links) {
  const root = document.getElementById("ementa");
  const chipBar = root.querySelector("[data-menu-chips]");
  const search = root.querySelector("[data-menu-search]");
  const count = root.querySelector("[data-menu-count]");
  const list = root.querySelector("[data-menu-list]");

  let category = ALL;

  function render() {
    const needle = normalise(search.value);

    const groups = menu.categories
      .filter((group) => category === ALL || group.id === category)
      .map((group) => ({
        ...group,
        dishes: group.dishes.filter((dish) => normalise(dish.name).includes(needle)),
      }))
      .filter((group) => group.dishes.length > 0);

    const total = groups.reduce((sum, group) => sum + group.dishes.length, 0);
    count.textContent = resultLabel(total);

    list.replaceChildren(
      ...(total > 0
        ? groups.map((group) =>
            el(
              "section",
              { class: "menu-group" },
              el("h3", { class: "menu-group__title", text: group.name }),
              el("ul", { class: "dish-list" }, ...group.dishes.map(dishRow)),
            ),
          )
        : [
            el(
              "div",
              { class: "menu__empty" },
              el("p", { text: "Não encontrámos nada com esse nome." }),
              el("a", { class: "btn btn--secondary", href: links.callLandline, text: "Ligar e perguntar" }),
            ),
          ]),
    );
  }

  function selectCategory(id) {
    category = id;
    chipBar.querySelectorAll("button").forEach((chip) => {
      chip.setAttribute("aria-pressed", String(chip.dataset.category === id));
    });
  }

  chipBar.replaceChildren(
    ...[{ id: ALL, name: "Todos" }, ...menu.categories].map((group) =>
      el("button", {
        type: "button",
        class: "chip-btn",
        "aria-pressed": String(group.id === category),
        "data-category": group.id,
        text: group.name,
        onclick: () => {
          search.value = "";
          selectCategory(group.id);
          render();
          // Once the chips are stuck to the top, jump back to the start of the list.
          const stuck = chipBar.getBoundingClientRect().top <= parseFloat(getComputedStyle(chipBar).top) + 1;
          if (stuck) list.scrollIntoView();
        },
      }),
    ),
  );

  search.addEventListener("input", () => {
    if (search.value.trim() && category !== ALL) selectCategory(ALL);
    render();
  });

  render();
  // The reserved height has done its job; filtering should be able to shrink the list.
  list.style.minHeight = "0";
}

export function initDailySpecials(menu, site) {
  const root = document.getElementById("pratos-do-dia");

  const { day } = lisbonClock();
  const dayName = site.hours.find((entry) => entry.day === day).name.toLowerCase();
  const dishes = menu.dailySpecials.find((entry) => entry.day === day)?.dishes ?? [];

  root.querySelector("[data-specials-day]").textContent = `Hoje, ${dayName}`;
  root.querySelector("[data-specials-list]").replaceChildren(...dishes.map((dish) => el("li", {}, textOrTag(dish))));

  const message = [
    `Pratos do dia de hoje (${dayName}) no ${site.name}:`,
    ...dishes.map((dish) => `- ${dish}`),
    `${site.address.street} · ${site.phones.landline.display}`,
  ].join("\n");

  root.querySelector("[data-specials-share]").href = `https://wa.me/?text=${encodeURIComponent(message)}`;
}
