import { ref } from 'vue'
import { API_URL } from '@/api'

// Shared between all components: the logged-in user (null when logged out)
const user = ref(null)

export function useAuth() {
  async function fetchUser() {
    try {
      const res = await fetch(`${API_URL}/api/auth/check`, { credentials: 'include' })
      user.value = res.ok ? (await res.json()).user : null
    } catch {
      user.value = null
    }
    return user.value
  }

  async function logout() {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    user.value = null
  }

  return { user, fetchUser, logout }
}
