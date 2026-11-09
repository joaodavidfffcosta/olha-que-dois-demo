/** Shared access to the restaurant's data and the links built from it. */

export const site = window.OQD_SITE;

const whatsappBase = `https://wa.me/${site.phones.mobile.e164.replace(/\D/g, "")}`;

export const links = Object.freeze({
  callLandline: `tel:${site.phones.landline.e164}`,
  callMobile: `tel:${site.phones.mobile.e164}`,
  whatsapp: whatsappBase,
  whatsappReservation: `${whatsappBase}?text=${encodeURIComponent(site.whatsappReservationText)}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`,
  facebook: site.socials.facebook,
  portfolio: site.credits.url,
  googleReviews: site.ratings.google.url,
  tripadvisor: site.ratings.tripadvisor.url,
});

const model = { ...site, links };

/** Reads a dotted path such as "phones.landline.display". */
export const read = (path) => path.split(".").reduce((node, key) => node?.[key], model);

/** Swaps tokens in copy for current values. */
export const fillFacts = (text) => text.replaceAll("{landline}", site.phones.landline.display);
