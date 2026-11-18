<template>
  <section aria-labelledby="emp-title">
    <h2 id="emp-title">Comptes employés</h2>

    <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="columns">
      <!-- KAN-64: create an employee account (never an administrator) -->
      <form class="panel" novalidate @submit.prevent="create">
        <h3>Créer un compte employé</h3>
        <div class="grid-2">
          <div class="field">
            <label for="e-last">Nom</label>
            <input id="e-last" v-model.trim="form.lastName" :aria-invalid="!!errors.lastName" />
            <p v-if="errors.lastName" class="err">{{ errors.lastName }}</p>
          </div>
          <div class="field">
            <label for="e-first">Prénom</label>
            <input id="e-first" v-model.trim="form.firstName" :aria-invalid="!!errors.firstName" />
            <p v-if="errors.firstName" class="err">{{ errors.firstName }}</p>
          </div>
        </div>
        <div class="field">
          <label for="e-email">Email (identifiant)</label>
          <input id="e-email" v-model.trim="form.email" type="email" autocomplete="off" :aria-invalid="!!errors.email" />
          <p v-if="errors.email" class="err">{{ errors.email }}</p>
        </div>
        <PasswordField id="e-password" v-model="form.password" :error="errors.password" />
        <p class="help">
          L'employé reçoit un email l'informant de la création de son compte, <strong>sans le mot de passe</strong> :
          communiquez-le-lui de vive voix.
        </p>
        <button type="submit" class="btn" :disabled="saving">{{ saving ? 'Création…' : 'Créer le compte' }}</button>
      </form>

      <div>
        <p v-if="loading" aria-busy="true">Chargement…</p>
        <div v-else class="table-wrap">
          <table class="data-table">
            <caption class="sr-only">Employés</caption>
            <thead>
              <tr>
                <th scope="col">Employé</th>
                <th scope="col">Email</th>
                <th scope="col">Compte</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!employees.length"><td colspan="3">Aucun employé.</td></tr>
              <tr v-for="e in employees" :key="e.id">
                <td>{{ e.firstName }} {{ e.lastName }}</td>
                <td>{{ e.email }}</td>
                <td>{{ e.isActive ? 'Actif' : 'Désactivé' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PasswordField from '@/components/PasswordField.vue'
import { api } from '@/services/http'
import { focusFirstError } from '@/utils/validation'

const employees = ref([])
const loading = ref(true)
const error = ref('')
const message = ref('')
const saving = ref(false)
const form = reactive({ lastName: '', firstName: '', email: '', password: '' })
const errors = reactive({})

async function load() {
  try {
    employees.value = await api('/api/admin/employees')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function create() {
  Object.keys(errors).forEach((k) => delete errors[k])
  error.value = ''
  message.value = ''
  saving.value = true
  try {
    const e = await api('/api/admin/employees', { method: 'POST', body: { ...form } })
    message.value = `Compte créé pour ${e.firstName} ${e.lastName}. Un email (sans mot de passe) lui a été envoyé.`
    Object.assign(form, { lastName: '', firstName: '', email: '', password: '' })
    await load()
  } catch (err) {
    error.value = err.message
    Object.assign(errors, err.details)
    focusFirstError()
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 860px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
