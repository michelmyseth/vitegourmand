import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Menus from '@/views/Menus.vue' 
import Contact from '@/views/Contact.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
import Legal from '@/views/Legal.vue'
import Terms from '@/views/Terms.vue'
import { useAuth } from '@/composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/menus',
    name: 'Menus',
    component: Menus
  },
    {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: "/register",
    name: "Register",
    component: Register
  },
  {
    path: '/legal',
    name: 'Legal',
    component: Legal
  },
  {
    path: '/terms',
    name: 'Terms',
    component: Terms
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { fetchUser } = useAuth()
  const user = await fetchUser()
  return user ? true : '/login'
})


export default router
