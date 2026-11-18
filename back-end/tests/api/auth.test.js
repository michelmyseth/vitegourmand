// KAN-33 to KAN-36: sign-up, login, logout (token revoked), current user
const { app, request, ACCOUNTS, loginAs } = require('../helpers');

const newUser = (overrides = {}) => ({
  lastName: 'Test',
  firstName: 'Jeanne',
  email: `jeanne.${Date.now()}@example.com`,
  phone: '0611223344',
  address: '1 rue du Test',
  postcode: '33000',
  city: 'Bordeaux',
  password: 'Valide#2026!',
  gdprConsent: true,
  ...overrides,
});

describe('POST /api/auth/register', () => {
  test('creates a customer account and logs it in (httpOnly cookie)', async () => {
    const res = await request(app).post('/api/auth/register').send(newUser());
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: 'user', firstName: 'Jeanne' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
  });

  test('the role sent by the browser is ignored: always a customer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser({ role: 'admin' }));
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
  });

  test('refuses a weak password and a missing GDPR consent, field by field', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser({ password: 'faible', gdprConsent: false }));
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('password');
    expect(res.body.details).toHaveProperty('gdprConsent');
  });

  test('refuses an email that already has an account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser({ email: ACCOUNTS.user.email }));
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  test('same generic message for a wrong password and an unknown email', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: ACCOUNTS.user.email, password: 'Mauvais#2026!' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'personne@example.com', password: 'Mauvais#2026!' });
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });
});

describe('GET /api/auth/me and logout', () => {
  test('a visitor gets user null', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.body.user).toBeNull();
  });

  test('a logged-in user gets their profile', async () => {
    const agent = await loginAs('user');
    const res = await agent.get('/api/auth/me');
    expect(res.body.user).toMatchObject({ email: ACCOUNTS.user.email, role: 'user' });
  });

  test('after logout, a copy of the old token no longer works (revoked server-side)', async () => {
    const login = await request(app).post('/api/auth/login').send(ACCOUNTS.user);
    const token = login.headers['set-cookie'][0].split(';')[0]; // "token=..."
    expect((await request(app).get('/api/orders').set('Cookie', token)).status).toBe(200);

    await request(app).post('/api/auth/logout').set('Cookie', token);

    expect((await request(app).get('/api/orders').set('Cookie', token)).status).toBe(401);
  });
});
