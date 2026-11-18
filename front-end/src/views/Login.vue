<template>
  <div class="page-root">
    <Header />

    <main class="page-main">
      <div class="container login">
        <h1>Connexion</h1>

        <p v-if="route.query.reset === 'ok'" class="alert alert-success" role="status">
          Votre mot de passe a été modifié. Vous pouvez vous connecter.
        </p>
        <p v-if="errorMessage" class="alert alert-error" role="alert">{{ errorMessage }}</p>

        <form novalidate @submit.prevent="login">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" v-model.trim="email" type="email" autocomplete="email" required />
          </div>
          <div class="field">
            <label for="password">Mot de passe</label>
            <input id="password" v-model="password" type="password" autocomplete="current-password" required />
          </div>

          <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Connexion…' : 'Se connecter' }}</button>

          <p class="forgot">
            <router-link to="/forgot-password" class="link">Mot de passe oublié ?</router-link>
          </p>
        </form>

        <p class="switch">
          Pas encore de compte ?
          <router-link :to="{ path: '/register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }" class="link">
            Créer un compte
          </router-link>
        </p>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/services/http'
import { useAuth, homeForRole } from '@/composables/useAuth'
import { safeRedirect } from '@/utils/validation'

const route = useRoute()
const router = useRouter()
const { setUser } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function login() {
  errorMessage.value = ''
  if (!email.value || !password.value) {
    errorMessage.value = 'Saisissez votre email et votre mot de passe.'
    return
  }

  loading.value = true
  try {
    const { user } = await api('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    setUser(user)
    // Page asked before login (e.g. an order), otherwise the space of the role
    router.push(safeRedirect(route.query.redirect, homeForRole(user.role)))
  } catch (err) {
    errorMessage.value = err.message
    password.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  max-width: 420px;
}

form {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

form .btn {
  width: 100%;
}

.forgot,
.switch {
  margin-top: 16px;
}
</style>
