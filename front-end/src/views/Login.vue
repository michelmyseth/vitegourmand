<template>
  <div class="page-root">
    <Header />

    <main class="page-content">
      <div class="login-container">
        <h1>Connexion</h1>

        <form @submit.prevent="login">
          <input
            type="email"
            v-model="email"
            placeholder="Email"
            required
          />

          <input
            type="password"
            v-model="password"
            placeholder="Mot de passe"
            required
          />

          <button type="submit">Se connecter</button>
        </form>

        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

        <p class="register-link">
          Nouvelle inscription ?
          <router-link to="/register">Cliquez ici</router-link>
        </p>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const router = useRouter()

const email = ref<string>('')
const password = ref<string>('')
const errorMessage = ref<string>('')

async function login() {
  errorMessage.value = ''

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      }),
      credentials: 'include'
    })

    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.error || 'Erreur de connexion'
      return
    }

    router.push('/profile')
  } catch (err) {
    errorMessage.value = 'Erreur réseau'
  }
}
</script>

<style scoped>
.page-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  width: 100%;
  margin: 10px 0;
  padding: 8px;
}

button {
  padding: 10px 15px;
  cursor: pointer;
}

.error {
  color: red;
}

.register-link {
  margin-top: 15px;
}
</style>
