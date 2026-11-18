<template>
  <div class="page-root">
    <Header />
    <main class="page-main">
      <div class="container narrow">
        <h1>Nouveau mot de passe</h1>

        <p v-if="!token" class="alert alert-error" role="alert">
          Lien incomplet. <router-link to="/forgot-password" class="link">Faire une nouvelle demande</router-link>
        </p>

        <form v-else class="panel" novalidate @submit.prevent="save">
          <p v-if="error" class="alert alert-error" role="alert">
            {{ error }}
            <router-link v-if="expired" to="/forgot-password" class="link">Nouvelle demande</router-link>
          </p>

          <PasswordField v-model="password" label="Nouveau mot de passe" :error="errors.password" />
          <div class="field">
            <label for="password2">Confirmer le mot de passe</label>
            <input id="password2" v-model="password2" type="password" autocomplete="new-password" :aria-invalid="!!errors.password2" aria-describedby="password2-err" />
            <p v-if="errors.password2" id="password2-err" class="err">{{ errors.password2 }}</p>
          </div>
          <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Enregistrement…' : 'Enregistrer' }}</button>
        </form>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import PasswordField from '@/components/PasswordField.vue'
import { api } from '@/services/http'
import { isStrongPassword, focusFirstError } from '@/utils/validation'

const route = useRoute()
const router = useRouter()
const token = typeof route.query.token === 'string' ? route.query.token : ''

const password = ref('')
const password2 = ref('')
const errors = reactive({})
const error = ref('')
const expired = ref(false)
const loading = ref(false)

async function save() {
  error.value = ''
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!isStrongPassword(password.value)) errors.password = 'Le mot de passe ne respecte pas toutes les règles.'
  if (password2.value !== password.value) errors.password2 = 'Les deux mots de passe sont différents.'
  if (Object.keys(errors).length) return focusFirstError()

  loading.value = true
  try {
    await api('/api/auth/reset-password', { method: 'POST', body: { token, password: password.value } })
    router.push({ path: '/login', query: { reset: 'ok' } })
  } catch (err) {
    Object.assign(errors, err.details)
    error.value = err.message
    expired.value = !err.details?.password
  } finally {
    loading.value = false
  }
}
</script>
