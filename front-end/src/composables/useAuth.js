import { ref } from 'vue'
import { api } from '@/services/http'

// Shared between all components: the logged-in user (null when logged out)
const user = ref(null)

/** Home page of each role after login */
export function homeForRole(role) {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/account'
}

export function useAuth() {
  async function fetchUser() {
    try {
      user.value = (await api('/api/auth/me')).user
    } catch {
      user.value = null
    }
    return user.value
  }

  function setUser(u) {
    user.value = u
  }

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
    }
  }

  return { user, fetchUser, setUser, logout }
}
