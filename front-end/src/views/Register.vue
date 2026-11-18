<template>
  <div class="page-root">
    <Header />

    <main class="page-main">
      <div class="container narrow">
        <h1>Créer un compte</h1>

        <p v-if="serverError" class="alert alert-error" role="alert">{{ serverError }}</p>

        <form novalidate @submit.prevent="register">
          <div class="grid-2">
            <div class="field">
              <label for="lastName">Nom</label>
              <input id="lastName" v-model.trim="form.lastName" autocomplete="family-name" :aria-invalid="!!errors.lastName" aria-describedby="lastName-err" />
              <p v-if="errors.lastName" id="lastName-err" class="err">{{ errors.lastName }}</p>
            </div>
            <div class="field">
              <label for="firstName">Prénom</label>
              <input id="firstName" v-model.trim="form.firstName" autocomplete="given-name" :aria-invalid="!!errors.firstName" aria-describedby="firstName-err" />
              <p v-if="errors.firstName" id="firstName-err" class="err">{{ errors.firstName }}</p>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" v-model.trim="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" aria-describedby="email-err" />
              <p v-if="errors.email" id="email-err" class="err">{{ errors.email }}</p>
            </div>
            <div class="field">
              <label for="phone">Téléphone portable</label>
              <input id="phone" v-model.trim="form.phone" type="tel" autocomplete="tel" placeholder="06 12 34 56 78" :aria-invalid="!!errors.phone" aria-describedby="phone-err" />
              <p v-if="errors.phone" id="phone-err" class="err">{{ errors.phone }}</p>
            </div>
          </div>

          <div class="field">
            <label for="address">Adresse postale</label>
            <input id="address" v-model.trim="form.address" autocomplete="street-address" :aria-invalid="!!errors.address" aria-describedby="address-err" />
            <p v-if="errors.address" id="address-err" class="err">{{ errors.address }}</p>
          </div>

          <div class="grid-2">
            <div class="field">
              <label for="postcode">Code postal</label>
              <input id="postcode" v-model.trim="form.postcode" inputmode="numeric" maxlength="5" autocomplete="postal-code" :aria-invalid="!!errors.postcode" aria-describedby="postcode-err" />
              <p v-if="errors.postcode" id="postcode-err" class="err">{{ errors.postcode }}</p>
            </div>
            <div class="field">
              <label for="city">Ville</label>
              <input id="city" v-model.trim="form.city" autocomplete="address-level2" :aria-invalid="!!errors.city" aria-describedby="city-err" />
              <p v-if="errors.city" id="city-err" class="err">{{ errors.city }}</p>
            </div>
          </div>

          <PasswordField v-model="form.password" :error="errors.password" />

          <div class="field">
            <label for="password2">Confirmer le mot de passe</label>
            <input id="password2" v-model="form.password2" type="password" autocomplete="new-password" :aria-invalid="!!errors.password2" aria-describedby="password2-err" />
            <p v-if="errors.password2" id="password2-err" class="err">{{ errors.password2 }}</p>
          </div>

          <div class="field">
            <label class="inline">
              <input v-model="form.gdprConsent" type="checkbox" :aria-invalid="!!errors.gdprConsent" aria-describedby="gdpr-err" />
              <span>
                J'accepte que mes données soient utilisées pour gérer mon compte et mes commandes, conformément à la
                <router-link to="/legal" class="link">politique de confidentialité</router-link>.
              </span>
            </label>
            <p v-if="errors.gdprConsent" id="gdpr-err" class="err">{{ errors.gdprConsent }}</p>
          </div>

          <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Création…' : 'Créer mon compte' }}</button>
        </form>

        <p class="switch">
          Déjà inscrit ?
          <router-link :to="{ path: '/login', query: route.query }" class="link">Connectez-vous</router-link>
        </p>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import PasswordField from '@/components/PasswordField.vue'
import { api } from '@/services/http'
import { useAuth } from '@/composables/useAuth'
import { EMAIL_RE, PHONE_RE, POSTCODE_RE, isStrongPassword, safeRedirect, focusFirstError } from '@/utils/validation'

const route = useRoute()
const router = useRouter()
const { setUser } = useAuth()

const form = reactive({
  lastName: '', firstName: '', email: '', phone: '',
  address: '', postcode: '', city: '',
  password: '', password2: '', gdprConsent: false
})
const errors = reactive({})
const serverError = ref('')
const loading = ref(false)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.lastName) errors.lastName = 'Le nom est obligatoire.'
  if (!form.firstName) errors.firstName = 'Le prénom est obligatoire.'
  if (!EMAIL_RE.test(form.email)) errors.email = 'Adresse email invalide.'
  if (!PHONE_RE.test(form.phone)) errors.phone = 'Numéro de portable invalide (ex. 06 12 34 56 78).'
  if (!form.address) errors.address = "L'adresse est obligatoire."
  if (!POSTCODE_RE.test(form.postcode)) errors.postcode = 'Code postal invalide (5 chiffres).'
  if (!form.city) errors.city = 'La ville est obligatoire.'
  if (!isStrongPassword(form.password)) errors.password = 'Le mot de passe ne respecte pas toutes les règles.'
  if (form.password2 !== form.password) errors.password2 = 'Les deux mots de passe sont différents.'
  if (!form.gdprConsent) errors.gdprConsent = 'Vous devez accepter la politique de confidentialité.'
  return Object.keys(errors).length === 0
}

async function register() {
  serverError.value = ''
  if (!validate()) return focusFirstError()

  loading.value = true
  try {
    const { password2, ...body } = form
    const { user } = await api('/api/auth/register', { method: 'POST', body })
    setUser(user)
    // Back to the page that asked for an account (e.g. the order of a menu)
    router.push(safeRedirect(route.query.redirect, '/'))
  } catch (err) {
    Object.assign(errors, err.details)
    serverError.value = err.message
    focusFirstError()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
form {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.switch {
  margin-top: 16px;
}
</style>
