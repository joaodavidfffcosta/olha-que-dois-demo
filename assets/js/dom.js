/** Small helpers for building markup safely, without innerHTML. */

export function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);

  for (const [name, value] of Object.entries(attributes)) {
    if (value == null || value === false) continue;
    if (name === "class") node.className = value;
    else if (name === "text") node.textContent = value;
    else if (name.startsWith("on")) node.addEventListener(name.slice(2), value);
    else node.setAttribute(name, value === true ? "" : value);
  }

  node.append(...children.filter((child) => child != null));
  return node;
}

/** Renders "[CONFIRMAR: ...]" style text as a visible tag, anything else as text. */
export const textOrTag = (text) =>
  text.startsWith("[") ? el("span", { class: "ph", text }) : document.createTextNode(text);
