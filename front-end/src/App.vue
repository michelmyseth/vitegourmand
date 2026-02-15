<script setup lang="ts">
import { ref } from 'vue'
import HeaderMenu from './components/HeaderMenu.vue'
import AppFooter from './components/Footer.vue'
import HomePage from './pages/HomePage.vue'
import ContactPage from './pages/ContactPage.vue'
import LoginPage from './pages/LoginPage.vue'
import InscriptionPage from './pages/InscriptionPage.vue'
import LegalPage from './pages/LegalPage.vue'
import TermsPage from './pages/TermsPage.vue'
import AllMenusPage from './pages/AllMenusPage.vue'
import OrderPage from './pages/OrderPage.vue'

const currentPage = ref<'home'|'contact'|'login'|'legal'|'terms'|'menus'|'inscription'|'order'>('home')

function navigate(page: typeof currentPage.value) {
  currentPage.value = page
  try {
    const pathMap: Record<string,string> = {
      home: '/',
      contact: '/contact',
      login: '/connexion',
      legal: '/legal',
      terms: '/terms',
      menus: '/menus',
      inscription: '/inscription'
    }
    const p = (pathMap as any)[page] ?? '/'
    window.history.pushState({}, '', p)
  } catch (e) {
    // ignore if environment doesn't allow history
  }
}

// Listen to custom events dispatched by pages (simple decoupled navigation)
window.addEventListener('navigate', (ev: any) => {
  const pg = ev?.detail?.page
  if (pg && typeof pg === 'string') navigate(pg as typeof currentPage.value)
})
</script>

<template>
  <div id="app">
    <HeaderMenu @navigate="navigate" />

    <div class="container">
      <main>
          <HomePage v-if="currentPage === 'home'" />
          <ContactPage v-if="currentPage === 'contact'" />
          <LoginPage v-if="currentPage === 'login'" @navigate="navigate" />
          <InscriptionPage v-if="currentPage === 'inscription'" @navigate="navigate" />
          <LegalPage v-if="currentPage === 'legal'" />
          <TermsPage v-if="currentPage === 'terms'" />
          <AllMenusPage v-if="currentPage === 'menus'" />
          <OrderPage v-if="currentPage === 'order'" />
      </main>
    </div>

    <AppFooter @navigate="navigate" />
  </div>
</template>

<style scoped>
/* Full-height layout with header/footer full-width and centered content */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

/* Centered content area that grows to push footer to bottom */
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
  width: 100%;
  flex: 1 0 auto;
}

main {
  margin: 20px 0;
}

/* Ensure footer stays at the bottom when content is short */
AppFooter, footer, .footer {
  /* visual styles are in the Footer component; this just ensures layout behavior */
  flex-shrink: 0;
}
</style>
