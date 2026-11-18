// Same rules as the back-end (back-end/utils/validate.js)
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RE = /^(?:\+33\s?|0)[67](?:[\s.-]?\d{2}){4}$/
export const POSTCODE_RE = /^\d{5}$/

export const PASSWORD_RULES = [
  { label: 'Au moins 10 caractères', test: (p) => p.length >= 10 },
  { label: 'Une majuscule', test: (p) => /[A-Z]/.test(p) },
  { label: 'Une minuscule', test: (p) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p) => /\d/.test(p) },
  { label: 'Un caractère spécial', test: (p) => /[^A-Za-z0-9]/.test(p) }
]

export const isStrongPassword = (p) => PASSWORD_RULES.every((r) => r.test(p))

/** Only internal paths, to avoid open redirects (?redirect=https://evil.com) */
export function safeRedirect(value, fallback = '/') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

/** Focus the first invalid field of the page */
export function focusFirstError() {
  setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus())
}
