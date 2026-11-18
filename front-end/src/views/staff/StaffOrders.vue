<template>
  <section aria-labelledby="orders-title">
    <h2 id="orders-title">Commandes</h2>

    <form class="filters panel" role="search" @submit.prevent>
      <div class="field">
        <label for="f-status">Statut</label>
        <select id="f-status" v-model="status">
          <option value="">Tous</option>
          <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="field">
        <label for="f-customer">Client (nom, email ou n° de commande)</label>
        <input id="f-customer" v-model.trim="customer" type="search" />
      </div>
    </form>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <p class="sr-only" aria-live="polite">{{ loading ? 'Chargement…' : `${orders.length} commande(s)` }}</p>

    <div class="table-wrap" :aria-busy="loading">
      <table class="data-table">
        <caption class="sr-only">
          Commandes, triées par date de prestation
        </caption>
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Prestation</th>
            <th scope="col">Client</th>
            <th scope="col">Menu</th>
            <th scope="col">Pers.</th>
            <th scope="col">Total</th>
            <th scope="col">Statut</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && !orders.length">
            <td colspan="8">Aucune commande.</td>
          </tr>
          <tr v-for="o in orders" :key="o.id">
            <td>{{ o.orderNumber }}</td>
            <td>
              {{ formatDate(o.date) }} {{ o.time }}<br /><span class="help">{{ o.city }}</span>
            </td>
            <td>
              {{ o.customerFirstName }} {{ o.customerLastName }}<br /><span class="help">{{ o.customerEmail }}</span>
            </td>
            <td>{{ o.menuTitle }}</td>
            <td>{{ o.people }}</td>
            <td>{{ euros(o.totalPrice) }}</td>
            <td><StatusBadge :status="o.status" /></td>
            <td>
              <router-link :to="`/employee/orders/${o.id}`" class="btn btn-small">
                Gérer<span class="sr-only"> la commande {{ o.orderNumber }}</span>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import { api } from '@/services/http'
import { euros, formatDate, STATUS_LABELS } from '@/utils/format'

const route = useRoute()
const router = useRouter()

// Filters are kept in the URL (back button, shareable link)
const status = ref(typeof route.query.status === 'string' ? route.query.status : '')
const customer = ref(typeof route.query.customer === 'string' ? route.query.customer : '')
const orders = ref([])
const loading = ref(true)
const error = ref('')

let requestId = 0
async function load() {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const result = await api('/api/staff/orders', { query: { status: status.value, customer: customer.value } })
    if (id === requestId) orders.value = result
  } catch (err) {
    if (id === requestId) error.value = err.message
  } finally {
    if (id === requestId) loading.value = false
  }
}

let debounce
watch([status, customer], () => {
  router.replace({ query: { status: status.value || undefined, customer: customer.value || undefined } })
  clearTimeout(debounce)
  debounce = setTimeout(load, 300)
})
load()
</script>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0 16px;
}

@media (max-width: 640px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
