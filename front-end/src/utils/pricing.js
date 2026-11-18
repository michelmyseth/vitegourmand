// Order price rules (KAN-48). Kept free of Vue/DOM code so the back-end
// can use the same rules: the server MUST recompute the price, never trust the client.
//
// - The menu price is given for the menu's minimum number of people.
// - 10 % discount when people >= minimum + 5.
// - Delivery: free in Bordeaux, otherwise 5 € + 0.59 €/km.
// All amounts are computed in cents to avoid floating point errors.

export const DISCOUNT_RATE = 0.1
export const DISCOUNT_EXTRA_PEOPLE = 5
export const DELIVERY_BASE_CENTS = 500
export const DELIVERY_PER_KM_CENTS = 59

const toCents = (euros) => Math.round(euros * 100)

/**
 * @param {{ price: number, minPeople: number }} menu  price in € for minPeople people
 * @param {number} people  number of people ordered
 * @param {{ inBordeaux: boolean, distanceKm: number | null }} delivery
 * @returns {{ menuCents, discountCents, deliveryCents, totalCents, pricePerPersonCents, hasDiscount }}
 */
export function computeOrderPrice(menu, people, delivery) {
  if (!menu || !Number.isInteger(people) || people < menu.minPeople) {
    throw new RangeError(`people must be an integer >= ${menu?.minPeople}`)
  }

  const pricePerPersonCents = toCents(menu.price) / menu.minPeople
  const menuCents = Math.round(pricePerPersonCents * people)

  const hasDiscount = people >= menu.minPeople + DISCOUNT_EXTRA_PEOPLE
  const discountCents = hasDiscount ? Math.round(menuCents * DISCOUNT_RATE) : 0

  let deliveryCents = 0
  if (!delivery?.inBordeaux) {
    const km = Math.max(0, delivery?.distanceKm ?? 0)
    deliveryCents = DELIVERY_BASE_CENTS + Math.round(km * DELIVERY_PER_KM_CENTS)
  }

  return {
    pricePerPersonCents: Math.round(pricePerPersonCents),
    menuCents,
    hasDiscount,
    discountCents,
    deliveryCents,
    totalCents: menuCents - discountCents + deliveryCents
  }
}

export function formatEuros(cents) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
