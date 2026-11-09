/**
 * Single source of truth for the restaurant's details.
 * Everything here comes from business-facts.md. Change a value once and the
 * whole site follows, including the structured data for search engines.
 *
 * Fields called "confirmed" or ending in "Confirmed" drive the visible
 * [CONFIRMAR] tags: set one to true after checking the value with Mário and
 * the tag disappears everywhere.
 *
 * The static HTML keeps a copy of the phones, address and hours so the page
 * still works without JavaScript. See "Manual sync points" in README.md.
 */
window.OQD_SITE = Object.freeze({
  name: "Olha que Dois",
  legalName: "Olha Que Dois – Actividades Hoteleiras, Lda.",
  tagline: "Cozinha portuguesa de sempre, na Penha de França.",
  category: "Cozinha tradicional portuguesa",
  since: 2002,
  seats: 65,
  priceRange: "€",

  address: Object.freeze({
    street: "Rua da Penha de França, 94",
    postalCode: "1170-034",
    // Facebook/Google say 1170-034; Apple Maps, Tripadvisor and cardapio say 1170-307.
    postalCodeConfirmed: false,
    city: "Lisboa",
    neighbourhood: "Penha de França",
    country: "PT",
  }),

  geo: Object.freeze({ lat: 38.723598, lng: -9.129276 }),

  phones: Object.freeze({
    landline: Object.freeze({ display: "218 162 108", e164: "+351218162108" }),
    mobile: Object.freeze({
      display: "917 102 599",
      e164: "+351917102599",
      whatsappConfirmed: false,
    }),
  }),

  socials: Object.freeze({
    facebook: "https://www.facebook.com/228207417275719",
    instagram: null, // None found: ask Mário.
  }),

  /**
   * day: JavaScript weekday number (0 = Sunday).
   * open/close: "HH:MM" in Lisbon time, or null when unknown.
   * confirmed: false when the sources disagree. Unconfirmed days are shown
   * on the page but left out of the structured data.
   */
  hours: Object.freeze([
    // Sources: closed / 07:00–15:00 / 07:00–11:00.
    { day: 1, name: "Segunda-feira", short: "segunda", open: null, close: null, confirmed: false },
    { day: 2, name: "Terça-feira", short: "terça", open: "07:00", close: "23:00", confirmed: true },
    { day: 3, name: "Quarta-feira", short: "quarta", open: "07:00", close: "23:00", confirmed: true },
    { day: 4, name: "Quinta-feira", short: "quinta", open: "07:00", close: "23:00", confirmed: true },
    { day: 5, name: "Sexta-feira", short: "sexta", open: "07:00", close: "23:00", confirmed: true },
    { day: 6, name: "Sábado", short: "sábado", open: "07:00", close: "23:00", confirmed: true },
    // Most sources say 23:00; Mygon says 21:30.
    { day: 0, name: "Domingo", short: "domingo", open: "07:00", close: "23:00", confirmed: false },
  ]),

  ratings: Object.freeze({
    google: Object.freeze({
      value: 4.3,
      valueLabel: "4,3",
      countLabel: "~840",
      url: "https://www.google.com/maps/search/?api=1&query=Olha%20que%20Dois%2C%20Rua%20da%20Penha%20de%20Fran%C3%A7a%2094%2C%20Lisboa",
    }),
    tripadvisor: Object.freeze({
      value: 3.9,
      countLabel: "42",
      url: "https://www.tripadvisor.com/Restaurant_Review-g189158-d5959249-Reviews-Olha_Que_Dois_Actividades_Hoteleiras_Lda-Lisbon_Lisbon_District_Central_Portugal.html",
    }),
  }),

  // Themes paraphrased from public reviews. No names, no invented quotes.
  highlights: Object.freeze([
    { title: "Ambiente familiar", text: "Há clientes que dizem ser tratados como família." },
    { title: "Doses generosas e preços justos", text: "Comida caseira, bem servida e a bom preço." },
    { title: "Atendimento simpático e rápido", text: "Serviço atencioso, com paciência para quem só fala inglês." },
  ]),

  gettingThere: Object.freeze({
    metro: "Metro Intendente, a cerca de 500 m",
    parking: "Estacionamento na rua, gratuito e pago",
    landmark: "Perto do Miradouro da Penha de França",
  }),

  whatsappReservationText: "Olá! Gostaria de reservar mesa para [n] pessoas no dia [data] às [hora].",

  // QR table-ordering demo. The number of tables is a placeholder for now.
  ordering: Object.freeze({ tables: 15, tablesConfirmed: false }),

  /**
   * {landline} is replaced with the current phone number.
   * note: visible [CONFIRMAR] tag, never sent to search engines.
   * confirmed: false keeps the whole question out of the structured data.
   */
  faq: Object.freeze([
    {
      question: "É preciso reservar?",
      answer: "Nas horas de maior movimento, aconselhamos a reservar. Basta ligar para o {landline}.",
      confirmed: true,
    },
    {
      question: "Têm pratos do dia?",
      answer: "Sim. Todos os dias, ao almoço, há cerca de três pratos do dia, servidos com acompanhamento e café.",
      confirmed: true,
    },
    {
      question: "Fazem take-away?",
      answer: "Sim, pode levar a comida para casa. Para saber o que há no dia, ligue para o {landline}.",
      confirmed: true,
    },
    {
      question: "Há fado?",
      answer: "Sim, ao domingo à tarde.",
      note: "[CONFIRMAR: dia e hora do fado]",
      confirmed: false,
    },
    {
      question: "Aceitam cartão?",
      answer: "Sim, aceitamos cartão de débito e pagamento contactless.",
      note: "[CONFIRMAR: cartão de crédito]",
      confirmed: true,
    },
    {
      question: "Há estacionamento?",
      answer: "Só na rua, com lugares gratuitos e pagos.",
      confirmed: true,
    },
  ]),

  /**
   * Stock placeholders, free under the Unsplash License. Replace each with a
   * real photo using the same file names (480, 960 and, for landscape, 1600
   * pixels wide), then update alt and label.
   * alt describes what the stock photo really shows, not the restaurant.
   */
  gallery: Object.freeze([
    // Benjamin Chambon: https://unsplash.com/photos/a-cooked-octopus-dish-with-potatoes-and-greens-0ezL9Nd679Q
    { key: "polvo", label: "polvo", alt: "Imagem de exemplo: polvo com batatas numa frigideira", width: 1600, height: 1067, widths: [480, 960, 1600] },
    // Milan Trninic: https://unsplash.com/photos/building-facade-with-patterned-tiles-and-balconies-qOVS0F12wvs
    { key: "fachada", label: "fachada", alt: "Imagem de exemplo: prédio revestido a azulejos, com varandas de ferro", width: 1600, height: 1107, widths: [480, 960, 1600] },
    // Junior Ramos: https://unsplash.com/photos/a-display-case-filled-with-lots-of-pastries-qMlfebXr0ok
    { key: "padaria", label: "balcão da padaria", alt: "Imagem de exemplo: vitrina com pastéis de nata", width: 1600, height: 2131, widths: [480, 960] },
    // Alexander Gluschenko: https://unsplash.com/photos/cozy-vintage-cafe-interior-with-warm-lighting-and-wooden-furniture-acaxDZb85O8
    { key: "sala", label: "sala", alt: "Imagem de exemplo: sala antiga com mesas de madeira e um candeeiro aceso", width: 1600, height: 900, widths: [480, 960, 1600] },
    // YunFengQ: https://unsplash.com/photos/savory-fried-rice-served-in-a-clay-pot-EtAODsTL_PM
    { key: "arroz", label: "arroz de pato", alt: "Imagem de exemplo: arroz numa travessa de barro", width: 1600, height: 1067, widths: [480, 960, 1600] },
    // David Magalhães: https://unsplash.com/photos/baked-dish-with-potatoes-eggs-and-olives-7AyseGersVI
    { key: "bacalhau", label: "bacalhau", alt: "Imagem de exemplo: travessa com batata, ovo cozido e azeitonas", width: 1600, height: 1203, widths: [480, 960, 1600] },
    // Esra Afşar: https://unsplash.com/photos/three-portuguese-custard-tarts-on-a-plate-pHLT1afzD6U
    { key: "sobremesa", label: "sobremesa", alt: "Imagem de exemplo: pastéis de nata num prato", width: 1600, height: 2400, widths: [480, 960] },
    // Tormius: https://unsplash.com/photos/closeup-photography-of-brown-acoustic-guitar-H-MiGI-l1Bs
    { key: "fado", label: "noite de fado", alt: "Imagem de exemplo: pormenor de uma guitarra acústica", width: 1600, height: 1064, widths: [480, 960, 1600] },
  ]),

  credits: Object.freeze({
    author: "João David Costa",
    url: "https://joaodavidfffcosta.github.io/portfolio/",
  }),
});
