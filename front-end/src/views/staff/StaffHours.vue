<template>
  <section aria-labelledby="hours-title">
    <h2 id="hours-title">Horaires d'ouverture</h2>
    <p class="help">Affichés dans le pied de page du site.</p>

    <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <form v-if="days.length" class="panel narrow" novalidate @submit.prevent="save">
      <table class="data-table">
        <caption class="sr-only">Horaires par jour</caption>
        <thead>
          <tr>
            <th scope="col">Jour</th>
            <th scope="col">Fermé</th>
            <th scope="col">Ouverture</th>
            <th scope="col">Fermeture</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in days" :key="d.dayOfWeek">
            <th scope="row">{{ DAY_NAMES[d.dayOfWeek - 1] }}</th>
            <td>
              <input v-model="d.isClosed" type="checkbox" :aria-label="`${DAY_NAMES[d.dayOfWeek - 1]} : fermé`" />
            </td>
            <td>
              <input v-model="d.openTime" type="time" :disabled="d.isClosed" :aria-label="`${DAY_NAMES[d.dayOfWeek - 1]} : ouverture`" :aria-invalid="!!errors[d.dayOfWeek]" />
            </td>
            <td>
              <input v-model="d.closeTime" type="time" :disabled="d.isClosed" :aria-label="`${DAY_NAMES[d.dayOfWeek - 1]} : fermeture`" :aria-invalid="!!errors[d.dayOfWeek]" />
              <p v-if="errors[d.dayOfWeek]" class="err">{{ errors[d.dayOfWeek] }}</p>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="submit"><button type="submit" class="btn" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button></p>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '@/services/http'
import { useOpeningHours, DAY_NAMES } from '@/composables/useOpeningHours'

const { set } = useOpeningHours()
const days = ref([])
const errors = reactive({})
const error = ref('')
const message = ref('')
const saving = ref(false)

onMounted(async () => {
  try {
    days.value = (await api('/api/opening-hours')).map((d) => ({
      ...d, openTime: d.openTime || '09:00', closeTime: d.closeTime || '18:00'
    }))
  } catch (err) {
    error.value = err.message
  }
})

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k])
  error.value = ''
  message.value = ''
  saving.value = true
  try {
    const saved = await api('/api/staff/opening-hours', { method: 'PUT', body: days.value })
    set(saved)
    message.value = 'Horaires enregistrés.'
  } catch (err) {
    error.value = err.message
    Object.assign(errors, err.details)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.submit {
  margin-top: 16px;
}
</style>
