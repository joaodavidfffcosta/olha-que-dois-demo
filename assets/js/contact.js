/** Copy-address button, click-to-load map and the WhatsApp reservation form. */

import { formatTime } from "./hours.js?v=20261109";

/** In-app browsers, such as WhatsApp's, can refuse the modern clipboard API. */
async function copyText(text, returnFocusTo) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.readOnly = true;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    returnFocusTo.focus();
    return copied;
  }
}

function initCopyAddress(site) {
  const button = document.querySelector("[data-copy-address]");
  const label = button.querySelector("[data-copy-label]");
  const status = document.querySelector("[data-copy-status]");
  const idleLabel = label.textContent;
  const { street, postalCode, city } = site.address;
  let resetTimer;

  button.addEventListener("click", async () => {
    const copied = await copyText(`${street}, ${postalCode} ${city}`, button);
    label.textContent = copied ? "Morada copiada" : "Não foi possível copiar";
    status.textContent = copied ? "Morada copiada" : "Não foi possível copiar a morada";
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      label.textContent = idleLabel;
      status.textContent = "";
    }, 2500);
  });
}

function initMap(site) {
  const map = document.querySelector("[data-map]");
  const button = map.querySelector("[data-map-load]");
  const { lat, lng } = site.geo;
  const bbox = [lng - 0.006, lat - 0.004, lng + 0.006, lat + 0.004].map((value) => value.toFixed(6)).join(",");

  button.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    frame.title = `Mapa com a localização do ${site.name}`;
    frame.className = "map__frame";

    // The map covers this message once it has loaded.
    const loading = document.createElement("p");
    loading.className = "map__address";
    loading.textContent = "A carregar o mapa…";

    map.replaceChildren(loading, frame);
    frame.focus();
  });
}

const ERROR_MESSAGES = {
  name: "Escreva o seu nome.",
  phone: "Escreva um número de telefone válido.",
  date: "Escolha uma data, de hoje em diante.",
  time: "Escolha a hora.",
  people: "Indique quantas pessoas vêm.",
};

function initReservationForm(links) {
  const form = document.querySelector("[data-reserve-form]");
  const dateField = form.elements.date;

  dateField.min = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());

  function validate(field) {
    const error = document.getElementById(`${field.id}-error`);
    const valid = field.validity.valid;
    if (valid) field.removeAttribute("aria-invalid");
    else field.setAttribute("aria-invalid", "true");
    error.textContent = valid ? "" : ERROR_MESSAGES[field.name];
    error.hidden = valid;
    return valid;
  }

  const fields = [...form.querySelectorAll("input")];

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      if (field.value) validate(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstInvalid = fields.map((field) => [field, validate(field)]).find(([, valid]) => !valid)?.[0];
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const { name, phone, date, time, people } = form.elements;
    const [year, month, day] = date.value.split("-");
    const guests = Number(people.value);

    const message =
      `Olá! Gostaria de reservar mesa para ${guests} ${guests === 1 ? "pessoa" : "pessoas"} ` +
      `no dia ${day}/${month}/${year} às ${formatTime(time.value)}. ` +
      `O meu nome é ${name.value.trim()} e o meu contacto é ${phone.value.trim()}.`;

    window.open(`${links.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });
}

export function initContact(site, links) {
  initCopyAddress(site);
  initMap(site);
  initReservationForm(links);
}
