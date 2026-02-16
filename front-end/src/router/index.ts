import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/HomePage.vue')
const Menus = () => import('../pages/AllMenusPage.vue')
const Contact = () => import('../pages/ContactPage.vue')
const Login = () => import('../pages/LoginPage.vue')
const Profile = () => import('../pages/ProfilePage.vue')
const Register = () => import('../pages/InscriptionPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/menus',
    name: 'menus',
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
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if ((to as any).meta?.requiresAuth) {
    try {
      const res = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (res.status === 401) {
        return next('/login')
      }

      next()
    } catch (err) {
      console.error(err)
      next('/login')
    }
  } else {
    next()
  }
})

export default router
