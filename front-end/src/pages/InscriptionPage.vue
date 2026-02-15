<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['navigate'])

const firstName = ref('')
const lastName = ref('')
const gsm = ref('')
const email = ref('')
const address = ref('')
const password = ref('')
const confirmPassword = ref('')

const errors = ref<string[]>([])
const success = ref('')

function validatePassword(p: string) {
  // At least 10 chars, one uppercase, one lowercase, one digit, one special
  const okLength = p.length >= 10
  const hasUpper = /[A-Z]/.test(p)
  const hasLower = /[a-z]/.test(p)
  const hasDigit = /\d/.test(p)
  const hasSpecial = /[^A-Za-z0-9]/.test(p)
  return okLength && hasUpper && hasLower && hasDigit && hasSpecial
}

function submit(e: Event) {
  e.preventDefault()
  errors.value = []
  success.value = ''

  if (!firstName.value.trim()) errors.value.push('Le prénom est requis.')
  if (!lastName.value.trim()) errors.value.push('Le nom est requis.')
  if (!/^[+0-9\s-]{6,}$/.test(gsm.value)) errors.value.push('Le numéro de GSM est invalide.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) errors.value.push('L\'adresse mail est invalide.')
  if (!address.value.trim()) errors.value.push('L\'adresse postale est requise.')
  if (!validatePassword(password.value)) errors.value.push('Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.')
  if (password.value !== confirmPassword.value) errors.value.push('Les mots de passe ne correspondent pas.')

  if (errors.value.length === 0) {
    // simulate account creation
    const role = 'utilisateur'
    success.value = 'Compte créé avec succès. Vous pouvez maintenant vous connecter.'
    // optionally reset form
    firstName.value = ''
    lastName.value = ''
    gsm.value = ''
    email.value = ''
    address.value = ''
    password.value = ''
    confirmPassword.value = ''

    // navigate to connexion after a short delay
    setTimeout(() => emit('navigate', 'login'), 1200)
  }
}
</script>

<template>
  <section>
    <h2>Création de compte</h2>
    <p>Remplissez le formulaire pour créer votre compte. Un rôle "utilisateur" sera attribué.</p>

    <form class="form" @submit.prevent="submit">
      <div v-if="errors.length" class="errors">
        <ul>
          <li v-for="(e,i) in errors" :key="i">{{ e }}</li>
        </ul>
      </div>
      <div v-if="success" class="success">{{ success }}</div>

      <label>Prénom
        <input v-model="firstName" type="text" />
      </label>

      <label>Nom
        <input v-model="lastName" type="text" />
      </label>

      <label>Numéro de GSM
        <input v-model="gsm" type="tel" placeholder="+33 6 12 34 56 78" />
      </label>

      <label>Adresse mail
        <input v-model="email" type="email" />
      </label>

      <label>Adresse postale
        <input v-model="address" type="text" />
      </label>

      <label>Mot de passe
        <input v-model="password" type="password" />
      </label>

      <label>Confirmer le mot de passe
        <input v-model="confirmPassword" type="password" />
      </label>

      <div class="notes">Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.</div>

      <div class="actions">
        <button type="submit">Créer un compte</button>
      </div>
    </form>
  </section>
</template>

<style scoped>
section{padding:8px 0}
.form{max-width:600px;display:flex;flex-direction:column;gap:10px}
label{display:flex;flex-direction:column;font-size:14px}
input{padding:8px;border:1px solid #ddd;border-radius:6px}
.actions{margin-top:8px}
.actions button{padding:8px 12px;border-radius:6px;border:1px solid #ddd;background:#fff}
.errors{background:#ffecec;border:1px solid #f5c2c2;padding:8px;border-radius:6px}
.success{background:#eaffea;border:1px solid #b7e6b7;padding:8px;border-radius:6px}
.notes{font-size:13px;color:#666}
</style>
