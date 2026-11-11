import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Menus from '@/views/Menus.vue' 
import Contact from '@/views/Contact.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
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
