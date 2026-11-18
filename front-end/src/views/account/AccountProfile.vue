<template>
  <section aria-labelledby="profile-title">
    <h2 id="profile-title">Mes informations</h2>

    <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
    <p v-if="serverError" class="alert alert-error" role="alert">{{ serverError }}</p>

    <form class="panel narrow" novalidate @submit.prevent="save">
      <div class="grid-2">
        <div class="field">
          <label for="lastName">Nom</label>
          <input
            id="lastName"
            v-model.trim="form.lastName"
            autocomplete="family-name"
            :aria-invalid="!!errors.lastName"
            aria-describedby="lastName-err"
          />
          <p v-if="errors.lastName" id="lastName-err" class="err">{{ errors.lastName }}</p>
        </div>
        <div class="field">
          <label for="firstName">Prénom</label>
          <input
            id="firstName"
            v-model.trim="form.firstName"
            autocomplete="given-name"
            :aria-invalid="!!errors.firstName"
            aria-describedby="firstName-err"
          />
          <p v-if="errors.firstName" id="firstName-err" class="err">{{ errors.firstName }}</p>
        </div>
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          autocomplete="email"
          :aria-invalid="!!errors.email"
          aria-describedby="email-err"
        />
        <p v-if="errors.email" id="email-err" class="err">{{ errors.email }}</p>
      </div>
      <div class="field">
        <label for="phone">Téléphone portable</label>
        <input
          id="phone"
          v-model.trim="form.phone"
          type="tel"
          autocomplete="tel"
          :aria-invalid="!!errors.phone"
          aria-describedby="phone-err"
        />
        <p v-if="errors.phone" id="phone-err" class="err">{{ errors.phone }}</p>
      </div>
      <div class="field">
        <label for="address">Adresse postale</label>
        <input
          id="address"
          v-model.trim="form.address"
          autocomplete="street-address"
          :aria-invalid="!!errors.address"
          aria-describedby="address-err"
        />
        <p v-if="errors.address" id="address-err" class="err">{{ errors.address }}</p>
      </div>
      <div class="grid-2">
        <div class="field">
          <label for="postcode">Code postal</label>
          <input
            id="postcode"
            v-model.trim="form.postcode"
            inputmode="numeric"
            maxlength="5"
            autocomplete="postal-code"
            :aria-invalid="!!errors.postcode"
            aria-describedby="postcode-err"
          />
          <p v-if="errors.postcode" id="postcode-err" class="err">{{ errors.postcode }}</p>
        </div>
        <div class="field">
          <label for="city">Ville</label>
          <input
            id="city"
            v-model.trim="form.city"
            autocomplete="address-level2"
            :aria-invalid="!!errors.city"
            aria-describedby="city-err"
          />
          <p v-if="errors.city" id="city-err" class="err">{{ errors.city }}</p>
        </div>
      </div>
      <button type="submit" class="btn" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, watchEffect } from 'vue'
import { api } from '@/services/http'
import { useAuth } from '@/composables/useAuth'
import { EMAIL_RE, PHONE_RE, POSTCODE_RE, focusFirstError } from '@/utils/validation'

const { user, setUser } = useAuth()
const FIELDS = ['lastName', 'firstName', 'email', 'phone', 'address', 'postcode', 'city']
const form = reactive(Object.fromEntries(FIELDS.map((k) => [k, ''])))
const errors = reactive({})
const message = ref('')
const serverError = ref('')
const saving = ref(false)

// Filled from the logged-in user (loaded by the router guard)
watchEffect(() => {
  if (user.value)
    FIELDS.forEach((k) => {
      form[k] = user.value[k] || ''
    })
})

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.lastName) errors.lastName = 'Le nom est obligatoire.'
  if (!form.firstName) errors.firstName = 'Le prénom est obligatoire.'
  if (!EMAIL_RE.test(form.email)) errors.email = 'Adresse email invalide.'
  if (!PHONE_RE.test(form.phone)) errors.phone = 'Numéro de portable invalide (ex. 06 12 34 56 78).'
  if (!form.address) errors.address = "L'adresse est obligatoire."
  if (!POSTCODE_RE.test(form.postcode)) errors.postcode = 'Code postal invalide (5 chiffres).'
  if (!form.city) errors.city = 'La ville est obligatoire.'
  return Object.keys(errors).length === 0
}

async function save() {
  message.value = ''
  serverError.value = ''
  if (!validate()) return focusFirstError()
  saving.value = true
  try {
    const res = await api('/api/users/me', { method: 'PUT', body: { ...form } })
    setUser(res.user)
    message.value = 'Vos informations ont été enregistrées.'
  } catch (err) {
    serverError.value = err.message
    Object.assign(errors, err.details)
    focusFirstError()
  } finally {
    saving.value = false
  }
}
</script>
