/** Printable sheet of table QR codes, generated in the browser with no CDN. */

import { el } from "./dom.js?v=20261109";
import { site } from "./site.js?v=20261109";
import { correction, generate } from "./vendor/lean-qr.js?v=20261109";

const CARDS_PER_PAGE = 6;
const QUIET_ZONE = 4;
const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(tag, attributes) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
}

function qrCode(text, label) {
  const code = generate(text, { minCorrectionLevel: correction.M });
  let path = "";

  for (let y = 0; y < code.size; y++) {
    for (let x = 0; x < code.size; x++) {
      if (code.get(x, y)) path += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`;
    }
  }

  const full = code.size + QUIET_ZONE * 2;
  const svg = svgNode("svg", {
    class: "qr-card__code",
    viewBox: `0 0 ${full} ${full}`,
    role: "img",
    "aria-label": label,
    "shape-rendering": "crispEdges",
    "data-url": text,
  });
  svg.append(svgNode("path", { d: path, fill: "#222222" }));
  return svg;
}

function brandMark() {
  const svg = svgNode("svg", { class: "qr-card__mark", "aria-hidden": "true" });
  svg.append(svgNode("use", { href: "assets/images/icons.svg#mark" }));
  return svg;
}

function tableCard(table) {
  const url = new URL(`mesa.html?mesa=${table}`, location.href).href;

  return el(
    "article",
    { class: "qr-card" },
    el("p", { class: "qr-card__brand" }, brandMark(), el("span", { text: site.name })),
    qrCode(url, `Código QR da mesa ${table}`),
    el("p", { class: "qr-card__table", text: `Mesa ${table}` }),
    el("p", { class: "qr-card__hint", text: "Leia para ver a ementa e pedir" }),
  );
}

const tables = Array.from({ length: site.ordering.tables }, (_, index) => index + 1);
const pages = [];
for (let start = 0; start < tables.length; start += CARDS_PER_PAGE) {
  pages.push(tables.slice(start, start + CARDS_PER_PAGE));
}

document.querySelector("[data-qr-pages]").replaceChildren(
  ...pages.map((page) => el("section", { class: "qr-page" }, ...page.map(tableCard))),
);

document.querySelector("[data-tables-tag]").hidden = site.ordering.tablesConfirmed;
document.querySelector("[data-local-warning]").hidden = !["localhost", "127.0.0.1"].includes(location.hostname);
document.querySelector("[data-print]").addEventListener("click", () => window.print());
