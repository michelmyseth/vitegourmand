// KAN-51 to KAN-54, KAN-61: order creation and life cycle
// The address service (internet) is replaced by a fixed answer: 10 km, outside Bordeaux.
jest.mock('../../services/geoService', () => ({
  deliveryFor: jest.fn(async () => ({ inBordeaux: false, km: 10, city: 'Mérignac', postcode: '33700' })),
}));

const { loginAs, inDays } = require('../helpers');
const { query } = require('../../config/db');

// Menu Classique of the seed: 45 € for 2 people, stock 20. Menu Vegan: stock 0.
const CLASSIQUE = 3;
const VEGAN = 5;

const orderBody = (overrides = {}) => ({
  menuId: CLASSIQUE,
  people: 7,
  address: '12 avenue de la Marne',
  postcode: '33700',
  city: 'Mérignac',
  date: inDays(10),
  time: '12:30',
  place: 'Salle des fêtes',
  ...overrides,
});

const stockOf = async (menuId) => (await query('SELECT stock FROM menu WHERE menu_id = $1', [menuId])).rows[0].stock;

describe('POST /api/orders', () => {
  let customer;
  beforeAll(async () => {
    customer = await loginAs('user');
  });

  test('the server computes the price itself and ignores the one sent by the browser', async () => {
    const res = await customer.post('/api/orders').send(orderBody({ totalPrice: 1, discount: 999 }));
    expect(res.status).toBe(201);
    // 7 × 22.50 = 157.50, -10 % = -15.75, delivery 5 + 10 × 0.59 = 10.90
    expect(res.body).toMatchObject({
      status: 'pending',
      menuPrice: 157.5,
      discount: 15.75,
      deliveryPrice: 10.9,
      totalPrice: 152.65,
    });
    expect(res.body.orderNumber).toMatch(/^VG-\d{4}-\d{4}$/);
  });

  test('each order takes one menu out of the stock', async () => {
    const before = await stockOf(CLASSIQUE);
    await customer.post('/api/orders').send(orderBody()).expect(201);
    expect(await stockOf(CLASSIQUE)).toBe(before - 1);
  });

  test('refuses a menu out of stock', async () => {
    const res = await customer.post('/api/orders').send(orderBody({ menuId: VEGAN, people: 2 }));
    expect(res.status).toBe(409);
  });

  test('refuses fewer people than the minimum of the menu', async () => {
    const res = await customer.post('/api/orders').send(orderBody({ menuId: 1, people: 3 })); // Noël: min 6
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('people');
  });

  test('refuses a date in the past', async () => {
    const res = await customer.post('/api/orders').send(orderBody({ date: inDays(-1) }));
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('date');
  });

  test('an employee cannot order', async () => {
    const employee = await loginAs('employee');
    expect((await employee.post('/api/orders').send(orderBody())).status).toBe(403);
  });
});

describe('order life cycle', () => {
  let customer, employee, order;

  beforeAll(async () => {
    [customer, employee] = await Promise.all([loginAs('user'), loginAs('employee')]);
    order = (await customer.post('/api/orders').send(orderBody())).body;
  });

  test('another customer cannot see the order', async () => {
    const other = await loginAs('otherUser');
    expect((await other.get(`/api/orders/${order.id}`)).status).toBe(404);
  });

  test('the employee follows the workflow and cannot skip a status', async () => {
    const skip = await employee.put(`/api/staff/orders/${order.id}/status`).send({ status: 'delivered' });
    expect(skip.status).toBe(409);

    const ok = await employee.put(`/api/staff/orders/${order.id}/status`).send({ status: 'accepted' });
    expect(ok.status).toBe(200);
  });

  test('once accepted, the customer can no longer cancel', async () => {
    const res = await customer.post(`/api/orders/${order.id}/cancel`);
    expect(res.status).toBe(409);
  });

  test('the employee must give a contact method and a reason to cancel', async () => {
    const missing = await employee.post(`/api/staff/orders/${order.id}/cancel`).send({});
    expect(missing.status).toBe(400);

    const before = await stockOf(CLASSIQUE);
    const ok = await employee
      .post(`/api/staff/orders/${order.id}/cancel`)
      .send({ contactMethod: 'phone', reason: 'Client injoignable le jour J' });
    expect(ok.status).toBe(200);
    expect(await stockOf(CLASSIQUE)).toBe(before + 1); // the menu goes back in stock
  });

  test('the customer sees the history of the order', async () => {
    const res = await customer.get(`/api/orders/${order.id}`);
    expect(res.body.history.map((h) => h.status)).toEqual(['pending', 'accepted', 'cancelled']);
  });
});
