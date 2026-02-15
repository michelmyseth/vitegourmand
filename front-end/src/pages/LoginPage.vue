<script setup lang="ts">
import { ref } from 'vue'
import { login as doLogin, pendingRedirect, isAuthenticated } from '../stores/auth'
import { selectedMenuId } from '../stores/selection'
const emit = defineEmits(['navigate'])

const email = ref('')
const password = ref('')
const message = ref('')

// forgot password flow
const showReset = ref(false)
const resetEmail = ref('')
const resetMessage = ref('')

function submit() {
  // Prototype: real auth must be implemented server-side with secure storage
  message.value = ''
  if (!email.value || !password.value) {
    message.value = 'Veuillez renseigner vos identifiants.'
    return
  }
  message.value = 'Connexion simulée — vous êtes connecté.'
  // perform mock login
  doLogin({ email: email.value })
  // if pending redirect exists, navigate there
  if (pendingRedirect.value) {
    const p = pendingRedirect.value
    if (p.menuId != null) selectedMenuId.value = p.menuId
    emit('navigate', p.page)
    pendingRedirect.value = null
  } else {
    emit('navigate', 'home')
  }
}

function toggleReset() {
  showReset.value = !showReset.value
  resetMessage.value = ''
}

function sendReset() {
  resetMessage.value = ''
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(resetEmail.value)) {
    resetMessage.value = 'Veuillez saisir une adresse mail valide.'
    return
  }
  // Simulate sending email
  resetMessage.value = 'Un lien de réinitialisation a été envoyé à ' + resetEmail.value + ' (simulation).'
  // clear field after send
  resetEmail.value = ''
}
</script>

<template>
  <section>
    <h2>Connexion</h2>
    <p>Accès réservé : employés, administrateurs et utilisateurs inscrits.</p>

    <form @submit.prevent="submit">
      <div>
        <label>Email
          <input v-model="email" type="email" />
        </label>
      </div>
      <div>
        <label>Mot de passe
          <input v-model="password" type="password" />
        </label>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
        <button type="submit">Se connecter</button>
        <button type="button" @click="toggleReset" style="background:transparent;border:none;color:#06c;cursor:pointer">Mot de passe oublié ?</button>
      </div>
    </form>

    <p v-if="message">{{ message }}</p>

    <section v-if="showReset" class="reset">
      <h3>Réinitialisation du mot de passe</h3>
      <p>Entrez votre adresse mail, un lien de réinitialisation sera envoyé (simulation).</p>
      <div>
        <label>Adresse mail
          <input v-model="resetEmail" type="email" />
        </label>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button type="button" @click="sendReset">Envoyer le lien</button>
        <button type="button" @click="toggleReset">Annuler</button>
      </div>
      <p v-if="resetMessage" style="margin-top:8px">{{ resetMessage }}</p>
    </section>

    <div style="margin-top:12px">
      <button type="button" @click="() => emit('navigate', 'inscription')" @click.prevent="emit('navigate','inscription')">Inscription</button>
    </div>
  </section>
</template>

<style scoped>
form div{margin:8px 0}
input{padding:6px;border:1px solid #ddd;border-radius:4px}
button{padding:8px 12px;margin-top:8px}
</style>
