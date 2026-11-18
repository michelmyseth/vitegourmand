<template>
  <section aria-labelledby="stats-title">
    <h2 id="stats-title">Statistiques</h2>
    <p class="help">Données issues de MongoDB, mises à jour à chaque commande (les commandes annulées ne sont pas comptées).</p>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <p v-if="loading" aria-busy="true">Chargement…</p>

    <template v-else-if="!error">
      <p v-if="!stats.length" class="panel">Aucune commande.</p>

      <!-- KAN-67: comparison of the number of orders per menu -->
      <div v-else class="panel">
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
            <caption class="sr-only">Nombre de commandes par menu</caption>
            <thead><tr><th scope="col">Menu</th><th scope="col">Commandes</th></tr></thead>
            <tbody>
              <tr v-for="s in byOrders" :key="s.menuId"><td>{{ s.menuTitle }}</td><td>{{ s.orders }}</td></tr>
            </tbody>
          </table>
        </details>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BarChart from '@/components/BarChart.vue'
import { api } from '@/services/http'

const stats = ref([])
const loading = ref(true)
const error = ref('')

const byOrders = computed(() => [...stats.value].sort((a, b) => b.orders - a.orders))

async function load() {
  loading.value = true
  error.value = ''
  try {
    stats.value = await api('/api/admin/stats')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<style scoped>
.table-view {
  margin-top: 12px;
}

.table-view summary {
  cursor: pointer;
  color: #1b5e20;
  text-decoration: underline;
  margin-bottom: 8px;
}
</style>
