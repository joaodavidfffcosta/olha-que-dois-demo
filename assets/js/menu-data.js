/**
 * Menu data: the only file to edit when the real menu arrives.
 *
 * To add a dish, add one line inside its category:
 *   dish("id-sem-espacos", "Nome do prato"),
 *
 * To add details, pass them as a third argument:
 *   dish("polvo", "Polvo", { price: 12, priceIsIndicative: true }),
 *
 * Dish fields:
 *   id:          string, URL-safe
 *   name:        string
 *   description: string or null
 *   price:       euros, or null to show "Preço a confirmar"
 *   priceIsIndicative: true for prices taken from reviews
 *   photo:       path such as "assets/images/polvo.webp", or null
 *   allergens:   e.g. ["peixe", "glúten"]; empty until confirmed
 *   flags:       e.g. ["vegetariano"]; empty until confirmed
 *   orderable:   shown on the QR table-ordering page
 *
 * Only dishes named in business-facts.md are listed. Which category each one
 * sits in is a guess until Mário sends the real menu.
 */
(() => {
  const dish = (id, name, details = {}) =>
    Object.freeze({
      id,
      name,
      description: null,
      price: null,
      priceIsIndicative: false,
      photo: null,
      allergens: [],
      flags: [],
      orderable: true,
      ...details,
    });

  const PENDING = Object.freeze(["[CONFIRMAR: pratos de hoje]"]);

  window.OQD_MENU = Object.freeze({
    categories: Object.freeze([
      {
        id: "entradas",
        name: "Entradas",
        dishes: [
          dish("queijo-fresco", "Queijo fresco"),
          dish("presunto", "Presunto"),
        ],
      },
      {
        id: "peixe",
        name: "Peixe",
        dishes: [
          dish("polvo", "Polvo", { price: 12, priceIsIndicative: true }), // Review price, to confirm.
          dish("dourada", "Dourada", { price: 9, priceIsIndicative: true }), // Review price, to confirm.
          dish("robalo-grelhado", "Robalo grelhado"),
          dish("bacalhau", "Bacalhau"),
        ],
      },
      {
        id: "carne",
        name: "Carne",
        dishes: [
          dish("carne-de-porco-a-alentejana", "Carne de porco à alentejana"),
          dish("bife-com-ovo-e-batata-frita", "Bife com ovo e batata frita"),
          dish("carne-na-pedra", "Carne na pedra"),
        ],
      },
      {
        id: "pratos-da-casa",
        name: "Pratos da casa",
        dishes: [
          dish("arroz-de-pato", "Arroz de pato"),
          dish("arroz-de-polvo", "Arroz de polvo"),
          dish("cozido-a-portuguesa", "Cozido à portuguesa"),
          dish("massada-de-garoupa", "Massada de garoupa"),
        ],
      },
      {
        id: "sobremesas",
        name: "Sobremesas",
        dishes: [
          dish("doce-da-casa", "Doce da casa"),
          dish("pastel-de-nata", "Pastel de nata"),
        ],
      },
      {
        id: "bebidas-e-vinhos",
        name: "Bebidas & vinhos",
        dishes: [
          dish("vinho-da-casa", "Vinho da casa"),
          dish("cerveja", "Cerveja", { price: 1.5, priceIsIndicative: true }), // Review price, to confirm.
          dish("cafe", "Café"),
        ],
      },
    ]),

    /**
     * Update this every day, or once a week if the dishes rotate.
     * day is the JavaScript weekday (0 = Sunday). Example:
     *   { day: 2, dishes: ["Arroz de pato", "Dourada", "Cozido à portuguesa"] },
     */
    dailySpecials: Object.freeze([
      { day: 1, dishes: PENDING }, // Monday
      { day: 2, dishes: PENDING }, // Tuesday
      { day: 3, dishes: PENDING }, // Wednesday
      { day: 4, dishes: PENDING }, // Thursday
      { day: 5, dishes: PENDING }, // Friday
      { day: 6, dishes: PENDING }, // Saturday
      { day: 0, dishes: PENDING }, // Sunday
    ]),
  });
})();
