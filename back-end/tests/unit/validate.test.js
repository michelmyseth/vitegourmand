const { validator, parseId } = require('../../utils/validate');

describe('validator', () => {
  test('collects one message per invalid field and throws a 400', () => {
    const v = validator({ email: 'pas-un-email', phone: '0123', postcode: '3300' });
    v.email();
    v.phone();
    v.postcode();
    expect(Object.keys(v.errors)).toEqual(['email', 'phone', 'postcode']);
    expect(() => v.throwIfErrors()).toThrow(expect.objectContaining({ status: 400 }));
  });

  test('normalises valid values (trimmed, lower-case email, phone without spaces)', () => {
    const v = validator({ email: '  Marie@Example.COM ', phone: '06 12 34 56 78' });
    expect(v.email()).toBe('marie@example.com');
    expect(v.phone()).toBe('0612345678');
    expect(v.errors).toEqual({});
  });

  test.each([
    ['court1!A', false], // too short
    ['sansmajuscule1!', false],
    ['SANSMINUSCULE1!', false],
    ['SansChiffre!!', false],
    ['SansSpecial123', false],
    ['Valide#2026!', true],
  ])('password %s -> valid: %s', (password, ok) => {
    const v = validator({ password });
    v.password();
    expect(!v.errors.password).toBe(ok);
  });

  test('ignores values that are not strings (e.g. an object sent instead of a text)', () => {
    const v = validator({ lastName: { $ne: '' } });
    v.required('lastName', 'Le nom est obligatoire.');
    expect(v.errors.lastName).toBe('Le nom est obligatoire.');
  });
});

describe('parseId', () => {
  test('accepts a positive integer, refuses anything else', () => {
    expect(parseId('12')).toBe(12);
    for (const bad of ['0', '-1', '1.5', 'abc', '1 OR 1=1']) {
      expect(() => parseId(bad)).toThrow(expect.objectContaining({ status: 400 }));
    }
  });
});
