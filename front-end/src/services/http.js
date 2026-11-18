import { API_URL } from '@/api'

// Error returned by the API: message + per-field errors (details)
export class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message)
    this.status = status
    this.details = details || {}
  }
}

/**
 * Calls the API with the session cookie.
 * @param {string} path  e.g. '/api/menus'
 * @param {{ method?: string, body?: any, query?: object }} options
 */
export async function api(path, { method = 'GET', body, query } = {}) {
  let url = `${API_URL}${path}`
  if (query) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params.append(k, v)
    })
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }

  const isForm = body instanceof FormData
  let res
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body)
    })
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur. Vérifiez votre connexion.')
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data?.error || 'Une erreur est survenue.', data?.details)
  return data
}
