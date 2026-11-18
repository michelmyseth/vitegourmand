<template>
  <section aria-labelledby="stats-title">
    <h2 id="stats-title">Statistiques</h2>
    <p class="help">
      Données issues de MongoDB, mises à jour à chaque commande (les commandes annulées ne sont pas comptées).
    </p>

    <!-- KAN-68: filters by menu and period, applied to every figure below -->
    <form class="filters panel" @submit.prevent>
      <div class="field">
        <label for="s-menu">Menu</label>
        <select id="s-menu" v-model="filters.menuId">
          <option value="">Tous les menus</option>
          <option v-for="m in menus" :key="m.id" :value="m.id">{{ m.title }}</option>
        </select>
      </div>
      <div class="field">
        <label for="s-from">Du</label>
        <input id="s-from" v-model="filters.from" type="date" :max="filters.to || undefined" />
      </div>
      <div class="field">
        <label for="s-to">Au</label>
        <input id="s-to" v-model="filters.to" type="date" :min="filters.from || undefined" />
      </div>
      <div class="field reset">
        <button type="button" class="btn btn-secondary" @click="reset">Réinitialiser</button>
      </div>
    </form>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <p v-if="loading" aria-busy="true">Chargement…</p>

    <template v-else-if="!error">
      <p v-if="!stats.length" class="panel">Aucune commande sur cette période.</p>

      <!-- KAN-68: revenue per menu -->
      <div v-else class="panel">
        <h3>Chiffre d'affaires par menu</h3>
        <p class="total">
          Total{{ periodLabel }} : <strong>{{ euros(totalRevenue) }}</strong> pour {{ totalOrders }} commande{{
            totalOrders > 1 ? 's' : ''
          }}
        </p>
        <BarChart
          :labels="byRevenue.map((s) => s.menuTitle)"
          :values="byRevenue.map((s) => s.revenue)"
          :format="euros"
          aria-label="Graphique en barres du chiffre d'affaires par menu. Les valeurs sont dans le tableau ci-dessous."
        />
        <div class="table-wrap">
          <table class="data-table revenue">
            <caption class="sr-only">
              Chiffre d'affaires par menu
            </caption>
            <thead>
              <tr>
                <th scope="col">Menu</th>
                <th scope="col">Commandes</th>
                <th scope="col">Chiffre d'affaires</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in byRevenue" :key="s.menuId">
                <td>{{ s.menuTitle }}</td>
                <td>{{ s.orders }}</td>
                <td>{{ euros(s.revenue) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>{{ totalOrders }}</td>
                <td>{{ euros(totalRevenue) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- KAN-67: comparison of the number of orders per menu -->
      <div v-if="stats.length" class="panel">
        <h3>Nombre de commandes par menu</h3>
        <BarChart
          :labels="byOrders.map((s) => s.menuTitle)"
          :values="byOrders.map((s) => s.orders)"
          :format="(v) => `${v} commande${v > 1 ? 's' : ''}`"
          integer
          aria-label="Graphique en barres du nombre de commandes par menu. Les valeurs sont dans le tableau ci-dessous."
        />
        <details class="table-view">
          <summary>Voir les données sous forme de tableau</summary>
          <table class="data-table">
            <caption class="sr-only">
              Nombre de commandes par menu
            </caption>
            <thead>
              <tr>
                <th scope="col">Menu</th>
                <th scope="col">Commandes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in byOrders" :key="s.menuId">
                <td>{{ s.menuTitle }}</td>
                <td>{{ s.orders }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import BarChart from '@/components/BarChart.vue'
import { api } from '@/services/http'
import { euros, formatDate } from '@/utils/format'

const stats = ref([])
const loading = ref(true)
const error = ref('')

const menus = ref([])
const filters = reactive({ menuId: '', from: '', to: '' })

const byOrders = computed(() => [...stats.value].sort((a, b) => b.orders - a.orders))
const byRevenue = computed(() => [...stats.value].sort((a, b) => b.revenue - a.revenue))
const totalRevenue = computed(() => Math.round(stats.value.reduce((t, s) => t + s.revenue, 0) * 100) / 100)
const totalOrders = computed(() => stats.value.reduce((t, s) => t + s.orders, 0))
const periodLabel = computed(() => {
  if (filters.from && filters.to) return ` du ${formatDate(filters.from)} au ${formatDate(filters.to)}`
  if (filters.from) return ` depuis le ${formatDate(filters.from)}`
  if (filters.to) return ` jusqu'au ${formatDate(filters.to)}`
  return ''
})

function reset() {
  Object.assign(filters, { menuId: '', from: '', to: '' })
}

let requestId = 0
async function load() {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const result = await api('/api/admin/stats', { query: { ...filters } })
    if (id !== requestId) return
    stats.value = result
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
watch(filters, () => {
  if (filters.from && filters.to && filters.from > filters.to) {
    error.value = 'La date de début doit être avant la date de fin.'
    return
  }
  load()
})

onMounted(async () => {
  load()
  menus.value = await api('/api/staff/menus').catch(() => [])
})
</script>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0 16px;
  align-items: end;
}

.total {
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.revenue {
  margin-top: 16px;
}

.revenue td:not(:first-child),
.revenue tfoot td {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 760px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }
}

.table-view {
  margin-top: 12px;
}

.table-view summary {
  cursor: pointer;
  color: var(--color-primary-dark);
  text-decoration: underline;
  margin-bottom: 8px;
}
</style>
