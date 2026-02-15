import { ref } from 'vue'

export const isAuthenticated = ref(false)
export const currentUser = ref<{email:string|null} | null>(null)

// pending redirect after login
export const pendingRedirect = ref<{page:string, menuId:number|null} | null>(null)

export function login(user: {email:string}){
  isAuthenticated.value = true
  currentUser.value = user
}

export function logout(){
  isAuthenticated.value = false
  currentUser.value = null
  pendingRedirect.value = null
}
