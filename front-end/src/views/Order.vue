<template>
  <div class="page-root">
    <Header />
    <main class="order container">
      <h1>Commander</h1>
      <p v-if="menu">Menu sélectionné : <strong>{{ menu.title }}</strong></p>
      <p v-else>Aucun menu sélectionné. <router-link to="/menus">Choisir un menu</router-link></p>
      <!-- Order form: KAN-47 / KAN-48 / KAN-50 -->
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { getMenu } from '@/data/menus'

const route = useRoute()
const menu = computed(() => getMenu(route.query.menu))
</script>

<style scoped>
.page-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.order {
  flex: 1;
  padding: 32px 0;
}

.order a {
  color: #2e7d32;
  text-decoration: underline;
}
</style>
