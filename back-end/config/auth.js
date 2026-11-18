// JWT settings. The token is stored in an httpOnly cookie (not readable by JavaScript).
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set (at least 16 characters)');
  }
  console.warn('JWT_SECRET is missing or too short: using an insecure development secret');
}

const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 1 day

module.exports = {
  JWT_SECRET: JWT_SECRET && JWT_SECRET.length >= 16 ? JWT_SECRET : 'dev-only-insecure-secret',
  TOKEN_TTL_SECONDS,
  COOKIE_NAME: 'token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
};
