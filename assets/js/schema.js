/**
 * Builds the JSON-LD from site-data.js, so a changed phone or hour updates it
 * too. Only confirmed facts go in: the postcode, Monday, Sunday and fado stay
 * out until their "confirmed" flag is true.
 *
 * Deliberately left out: aggregateRating (Google doesn't allow a business to
 * publish its own ratings this way) and image (the photos are stock).
 */

import { fillFacts, links } from "./site.js?v=20261109";

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function openingHours(hours) {
  const groups = new Map();

  for (const entry of hours) {
    if (!entry.confirmed || !entry.open) continue;
    const key = `${entry.open}-${entry.close}`;
    if (!groups.has(key)) groups.set(key, { opens: entry.open, closes: entry.close, days: [] });
    groups.get(key).days.push(SCHEMA_DAYS[entry.day]);
  }

  return [...groups.values()].map(({ opens, closes, days }) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: days,
    opens,
    closes,
  }));
}

function inject(id, data) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

export function injectStructuredData(site) {
  const url = `${location.origin}${location.pathname}`;
  const { street, postalCode, postalCodeConfirmed, city, country } = site.address;

  inject("schema-restaurant", {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.name,
    url,
    telephone: site.phones.landline.e164,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: city,
      addressCountry: country,
      ...(postalCodeConfirmed ? { postalCode } : {}),
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: openingHours(site.hours),
    servesCuisine: "Portuguesa",
    priceRange: site.priceRange,
    acceptsReservations: true,
    hasMenu: `${url}#ementa`,
    sameAs: [links.facebook],
  });

  inject("schema-faq", {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq
      .filter((item) => item.confirmed)
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: fillFacts(item.answer) },
      })),
  });
}
