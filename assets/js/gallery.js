/** Photo gallery with an accessible lightbox built on the native <dialog>. */

import { el } from "./dom.js?v=20261109";

const srcset = (item) =>
  item.widths.map((width) => `assets/images/galeria-${item.key}-${width}.webp ${width}w`).join(", ");

const SWIPE_DISTANCE = 50;

export function initGallery(items) {
  const track = document.querySelector("[data-gallery]");
  const dialog = document.querySelector("[data-lightbox]");
  const image = dialog.querySelector("[data-lightbox-image]");
  const caption = dialog.querySelector("[data-lightbox-caption]");
  const counter = dialog.querySelector("[data-lightbox-count]");

  let index = 0;

  function show(next) {
    index = (next + items.length) % items.length;
    const item = items[index];

    image.srcset = srcset(item);
    image.sizes = "100vw";
    image.src = `assets/images/galeria-${item.key}-960.webp`;
    image.alt = item.alt;
    image.width = item.width;
    image.height = item.height;
    caption.textContent = `[FOTO: ${item.label}, substituir por foto real]`;
    counter.textContent = `${index + 1} de ${items.length}`;
  }

  track.replaceChildren(
    ...items.map((item, position) =>
      el(
        "li",
        { class: "gallery__cell" },
        el(
          "button",
          {
            type: "button",
            class: "gallery__item",
            "aria-label": `Ampliar imagem: ${item.label}`,
            onclick: () => {
              show(position);
              dialog.showModal();
            },
          },
          el("img", {
            class: "gallery__image",
            src: `assets/images/galeria-${item.key}-480.webp`,
            srcset: srcset(item),
            sizes: "(min-width: 640px) 50vw, 80vw",
            width: item.width,
            height: item.height,
            alt: item.alt,
            loading: "lazy",
            decoding: "async",
          }),
          el("span", { class: "ph gallery__tag", text: `[FOTO: ${item.label}]` }),
        ),
      ),
    ),
  );

  dialog.querySelector("[data-lightbox-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(index - 1));
  dialog.querySelector("[data-lightbox-next]").addEventListener("click", () => show(index + 1));

  // A click on the dark area around the photo closes the lightbox.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.matches("[data-lightbox-stage]")) dialog.close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });

  let swipeStart = null;

  image.addEventListener("pointerdown", (event) => {
    swipeStart = event.clientX;
  });

  image.addEventListener("pointerup", (event) => {
    if (swipeStart === null) return;
    const distance = event.clientX - swipeStart;
    swipeStart = null;
    if (Math.abs(distance) >= SWIPE_DISTANCE) show(index + (distance < 0 ? 1 : -1));
  });
}
