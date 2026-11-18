// KAN-48: price rules (menu price for the minimum of people, -10 % from minimum + 5, delivery)
const { computeOrderPrice } = require('../../utils/pricing');

const menu = { price: 45, minPeople: 2 }; // 22.50 € per person
const bordeaux = { inBordeaux: true, km: 0 };

describe('computeOrderPrice', () => {
  test('menu price for the minimum number of people, free delivery in Bordeaux', () => {
    expect(computeOrderPrice(menu, 2, bordeaux)).toEqual({
      menuPrice: 45,
      discount: 0,
      deliveryPrice: 0,
      totalPrice: 45,
    });
  });

  test('price per person for more people, no discount below minimum + 5', () => {
    expect(computeOrderPrice(menu, 6, bordeaux)).toMatchObject({ menuPrice: 135, discount: 0, totalPrice: 135 });
  });

  test('10 % discount from minimum + 5 people', () => {
    expect(computeOrderPrice(menu, 7, bordeaux)).toMatchObject({
      menuPrice: 157.5,
      discount: 15.75,
      totalPrice: 141.75,
    });
  });

  test('delivery outside Bordeaux: 5 € + 0.59 € per km', () => {
    expect(computeOrderPrice(menu, 2, { inBordeaux: false, km: 10 })).toMatchObject({
      deliveryPrice: 10.9,
      totalPrice: 55.9,
    });
  });

  test('amounts in cents: no floating point error', () => {
    const { totalPrice } = computeOrderPrice({ price: 110, minPeople: 4 }, 9, { inBordeaux: false, km: 12.3 });
    // 27.50 × 9 = 247.50, -24.75, + 5 + 7.26
    expect(totalPrice).toBe(235.01);
  });
});
