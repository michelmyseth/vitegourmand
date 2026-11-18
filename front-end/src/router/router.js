import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Menus from '@/views/Menus.vue'
import Contact from '@/views/Contact.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Legal from '@/views/Legal.vue'
import Terms from '@/views/Terms.vue'
import MenuDetail from '@/views/MenuDetail.vue'
import Order from '@/views/Order.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import AccountLayout from '@/views/account/AccountLayout.vue'
import AccountOrders from '@/views/account/AccountOrders.vue'
import AccountOrderDetail from '@/views/account/AccountOrderDetail.vue'
import AccountProfile from '@/views/account/AccountProfile.vue'
import StaffLayout from '@/views/staff/StaffLayout.vue'
import StaffMenus from '@/views/staff/StaffMenus.vue'
import StaffDishes from '@/views/staff/StaffDishes.vue'
import StaffHours from '@/views/staff/StaffHours.vue'
import StaffOrders from '@/views/staff/StaffOrders.vue'
import StaffReviews from '@/views/staff/StaffReviews.vue'
import StaffOrderDetail from '@/views/staff/StaffOrderDetail.vue'
import AdminEmployees from '@/views/admin/AdminEmployees.vue'
import AdminStats from '@/views/admin/AdminStats.vue'
import { useAuth, homeForRole } from '@/composables/useAuth'

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
    path: '/menus/:id',
    name: 'MenuDetail',
    component: MenuDetail
  },
  {
    path: '/order',
    name: 'Order',
    component: Order,
    meta: { requiresAuth: true, roles: ['user'] }
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
    path: '/account',
    component: AccountLayout,
    meta: { requiresAuth: true, roles: ['user'] },
    children: [
      { path: '', name: 'Account', component: AccountOrders },
      { path: 'orders/:id', name: 'AccountOrder', component: AccountOrderDetail },
      { path: 'profile', name: 'AccountProfile', component: AccountProfile }
    ]
  },
  { path: '/profile', redirect: '/account' },
  // Administrator area (same layout as the employee area)
  {
    path: '/admin',
    component: StaffLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: '', redirect: '/admin/stats' },
      { path: 'stats', name: 'AdminStats', component: AdminStats },
      { path: 'employees', name: 'AdminEmployees', component: AdminEmployees }
    ]
  },
  // Employee area; the administrator has the same rights (KAN-66)
  {
    path: '/employee',
    component: StaffLayout,
    meta: { requiresAuth: true, roles: ['employee', 'admin'] },
    children: [
      { path: '', redirect: '/employee/orders' },
      { path: 'orders', name: 'StaffOrders', component: StaffOrders },
      { path: 'orders/:id', name: 'StaffOrder', component: StaffOrderDetail },
      { path: 'menus', name: 'StaffMenus', component: StaffMenus },
      { path: 'dishes', name: 'StaffDishes', component: StaffDishes },
      { path: 'hours', name: 'StaffHours', component: StaffHours },
      { path: 'reviews', name: 'StaffReviews', component: StaffReviews }
    ]
  },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  {
    path: '/register',
    name: 'Register',
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

// meta.requiresAuth: logged-in users only; meta.roles: only these roles
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.roles) return true

  const { fetchUser } = useAuth()
  const user = await fetchUser()
  if (!user) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta.roles && !to.meta.roles.includes(user.role)) return { path: homeForRole(user.role) }
  return true
})

export default router
