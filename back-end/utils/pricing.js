// Order price rules (KAN-48), same rules as front-end/src/utils/pricing.js.
// The server always recomputes the price: the amounts sent by the browser are ignored.
// - The menu price is given for the menu's minimum number of people.
// - 10 % discount when people >= minimum + 5.
// - Delivery: free in Bordeaux, otherwise 5 € + 0.59 €/km.
// Amounts are computed in cents to avoid floating point errors.

const DISCOUNT_RATE = 0.1;
const DISCOUNT_EXTRA_PEOPLE = 5;
const DELIVERY_BASE_CENTS = 500;
const DELIVERY_PER_KM_CENTS = 59;

const toCents = (euros) => Math.round(euros * 100);

/**
 * @param {{ price: number, minPeople: number }} menu  price in € for minPeople people
 * @param {number} people
 * @param {{ inBordeaux: boolean, km: number }} delivery
 * @returns prices in euros, ready to be stored
 */
function computeOrderPrice(menu, people, delivery) {
  const pricePerPersonCents = toCents(menu.price) / menu.minPeople;
  const menuCents = Math.round(pricePerPersonCents * people);
  const discountCents = people >= menu.minPeople + DISCOUNT_EXTRA_PEOPLE ? Math.round(menuCents * DISCOUNT_RATE) : 0;
  const deliveryCents = delivery.inBordeaux
    ? 0
    : DELIVERY_BASE_CENTS + Math.round(Math.max(0, delivery.km) * DELIVERY_PER_KM_CENTS);

  return {
    menuPrice: menuCents / 100,
    discount: discountCents / 100,
    deliveryPrice: deliveryCents / 100,
    totalPrice: (menuCents - discountCents + deliveryCents) / 100,
  };
}

module.exports = { computeOrderPrice };
