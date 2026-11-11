<template>
  <div class="page-root">
    <Header />

    <main class="page-content">
      <div class="register-container">
        <h1>Inscription</h1>

        <form @submit.prevent="register">
          <input
            type="text"
            v-model="username"
            placeholder="Nom d'utilisateur"
            required
          />

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

          <button type="submit">S'inscrire</button>
        </form>

        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="success">
          {{ successMessage }}
        </p>

        <p class="login-link">
          Déjà inscrit ?
          <router-link to="/login">Connectez-vous</router-link>
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

const username = ref('')
const email = ref('')
const password = ref('')

const errorMessage = ref('')
const successMessage = ref('')

async function register() {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      }),
      credentials: 'include'
    })

    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.error || "Erreur lors de l'inscription"
      return
    }

    successMessage.value =
      "Inscription réussie ! Vous allez être redirigé vers la page de connexion..."

    setTimeout(() => {
      router.push('/login')
    }, 3000)
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

.register-container {
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

.success {
  color: green;
}

.login-link {
  margin-top: 15px;
}
</style>
