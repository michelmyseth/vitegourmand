// KAN-32 / KAN-66: each area is reserved to its roles, checked by the server
const { app, request, loginAs } = require('../helpers');

describe('access control by role', () => {
  let user, employee, admin;

  beforeAll(async () => {
    [user, employee, admin] = await Promise.all([loginAs('user'), loginAs('employee'), loginAs('admin')]);
  });

  test.each(['/api/orders', '/api/staff/orders', '/api/admin/stats'])('visitor -> 401 on %s', async (url) => {
    expect((await request(app).get(url)).status).toBe(401);
  });

  test('customer: own orders yes, employee and admin areas no', async () => {
    expect((await user.get('/api/orders')).status).toBe(200);
    expect((await user.get('/api/staff/orders')).status).toBe(403);
    expect((await user.get('/api/admin/stats')).status).toBe(403);
  });

  test('employee: employee area yes, admin area no', async () => {
    expect((await employee.get('/api/staff/orders')).status).toBe(200);
    expect((await employee.get('/api/admin/employees')).status).toBe(403);
  });

  test('administrator: employee area and admin area', async () => {
    expect((await admin.get('/api/staff/orders')).status).toBe(200);
    expect((await admin.get('/api/admin/stats')).status).toBe(200);
  });

  test('a token with a forged role is refused (signature checked)', async () => {
    const forged = 'token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsInJvbGUiOiJhZG1pbiJ9.fausse-signature';
    expect((await request(app).get('/api/admin/stats').set('Cookie', forged)).status).toBe(401);
  });
});

describe('employee accounts (KAN-64, KAN-65)', () => {
  test('the admin creates an employee: always the employee role', async () => {
    const admin = await loginAs('admin');
    const res = await admin.post('/api/admin/employees').send({
      email: `employe.${Date.now()}@vitegourmand.fr`,
      password: 'Employe#2026!',
      lastName: 'Nouveau',
      firstName: 'Paul',
      role: 'admin',
    });
    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toMatch(/Employe#2026!/);
    expect(res.body.role).toBe('employee');
  });

  test('a disabled employee is cut off immediately, even with a valid token', async () => {
    const admin = await loginAs('admin');
    const employee = await loginAs('employee');
    const { body } = await employee.get('/api/auth/me');

    await admin.put(`/api/admin/employees/${body.user.id}/active`).send({ isActive: false }).expect(200);
    expect((await employee.get('/api/staff/orders')).status).toBe(401);

    // Re-enabled so that the other tests can use the account
    await admin.put(`/api/admin/employees/${body.user.id}/active`).send({ isActive: true }).expect(200);
  });
});
