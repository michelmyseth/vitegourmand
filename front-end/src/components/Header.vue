<template>
  <header class="navbar">
    <router-link to="/" class="navbar-title">Vite &amp; Gourmand</router-link>

    <button
      class="burger"
      type="button"
      aria-controls="main-nav"
      :aria-expanded="open"
      :aria-label="open ? 'Fermer le menu' : 'Ouvrir le menu'"
      @click="open = !open"
    >
      <span aria-hidden="true">{{ open ? '✕' : '☰' }}</span>
    </button>

    <nav id="main-nav" class="navbar-links" :class="{ open }" aria-label="Navigation principale">
      <router-link to="/">Accueil</router-link>
      <router-link to="/menus">Menus</router-link>
      <router-link to="/contact">Contact</router-link>
      <template v-if="user">
        <router-link :to="homeForRole(user.role)">{{ spaceLabel }}</router-link>
        <button type="button" class="navbar-btn" @click="onLogout">Déconnexion</button>
      </template>
      <router-link v-else to="/login" class="navbar-btn">Connexion</router-link>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, homeForRole } from '@/composables/useAuth'

const { user, fetchUser, logout } = useAuth()
const route = useRoute()
const router = useRouter()
const open = ref(false)

const spaceLabel = computed(
  () => ({ admin: 'Espace admin', employee: 'Espace employé' })[user.value?.role] || 'Mon espace'
)

onMounted(fetchUser)

// Close the mobile menu after navigating
watch(
  () => route.fullPath,
  () => {
    open.value = false
  }
)

async function onLogout() {
  await logout()
  router.push('/')
}
</script>

<style>
.navbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar-title {
  font-size: 2rem;
  font-weight: bold;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-links a {
  text-decoration: none;
  color: #222;
  font-weight: 500;
  font-size: 1rem;
}

.navbar-links a.router-link-exact-active {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.navbar-links .navbar-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
}

.navbar-links .navbar-btn:hover {
  background: var(--color-primary-dark);
}

.navbar a:focus-visible,
.navbar button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.burger {
  display: none;
  background: none;
  color: #222;
  font-size: 1.6rem;
  padding: 4px 10px;
}

.burger:hover {
  background: #f0f0f0;
}

@media (max-width: 768px) {
  .navbar {
    padding: 16px;
  }

  .navbar-title {
    font-size: 1.5rem;
  }

  .burger {
    display: block;
  }

  .navbar-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }

  .navbar-links.open {
    display: flex;
  }

  .navbar-links a,
  .navbar-links .navbar-btn {
    padding: 14px 16px;
    border-top: 1px solid var(--color-line);
    border-radius: 0;
    text-align: left;
  }
}
</style>
