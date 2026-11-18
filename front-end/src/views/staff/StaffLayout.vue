<template>
  <div class="page-root">
    <Header />
    <main class="page-main">
      <div class="container">
        <h1>{{ isAdmin ? 'Espace administrateur' : 'Espace employé' }}</h1>
        <nav class="tabs" aria-label="Rubriques">
          <router-link v-for="t in tabs" :key="t.to" :to="t.to" active-class="active">{{ t.label }}</router-link>
        </nav>
        <router-view />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')

// The administrator has every employee feature, plus its own tabs (KAN-66)
const tabs = computed(() => [
  ...(isAdmin.value
    ? [
        { to: '/admin/stats', label: 'Statistiques' },
        { to: '/admin/employees', label: 'Employés' }
      ]
    : []),
  { to: '/employee/orders', label: 'Commandes' },
  { to: '/employee/menus', label: 'Menus' },
  { to: '/employee/dishes', label: 'Plats' },
  { to: '/employee/hours', label: 'Horaires' },
  { to: '/employee/reviews', label: 'Avis' }
])
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #c8e6c9;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tabs a {
  padding: 8px 16px;
  border-radius: 6px 6px 0 0;
  color: var(--color-primary-dark);
  font-weight: 600;
}

.tabs a.active {
  background: var(--color-primary);
  color: #fff;
}
</style>
