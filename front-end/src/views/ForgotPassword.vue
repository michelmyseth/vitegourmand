<template>
  <div class="page-root">
    <Header />
    <main class="page-main">
      <div class="container narrow">
        <h1>Mot de passe oublié</h1>

        <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
        <template v-else>
          <p class="intro">Indiquez l'email de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
          <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

          <form class="panel" novalidate @submit.prevent="send">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" v-model.trim="email" type="email" autocomplete="email" :aria-invalid="!!error" />
            </div>
            <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Envoi…' : 'Envoyer le lien' }}</button>
          </form>
        </template>

        <p><router-link to="/login" class="link">Retour à la connexion</router-link></p>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/services/http'
import { EMAIL_RE } from '@/utils/validation'

const email = ref('')
const error = ref('')
const message = ref('')
const loading = ref(false)

async function send() {
  error.value = ''
  if (!EMAIL_RE.test(email.value)) {
    error.value = 'Adresse email invalide.'
    return
  }
  loading.value = true
  try {
    message.value = (await api('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })).message
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.intro {
  margin-bottom: 16px;
}
</style>
