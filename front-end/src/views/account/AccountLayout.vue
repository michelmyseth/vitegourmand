<template>
  <div class="page-root">
    <Header />
    <main class="page-main">
      <div class="container">
        <h1>Mon espace</h1>
        <nav class="tabs" aria-label="Mon espace">
          <router-link to="/account" exact-active-class="active" :class="{ active: route.path.startsWith('/account/orders') }">
            Mes commandes
          </router-link>
          <router-link to="/account/profile" active-class="active">Mes informations</router-link>
        </nav>
        <router-view />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()
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
  color: #1b5e20;
  font-weight: 600;
}

.tabs a.active {
  background: #2e7d32;
  color: #fff;
}
</style>
