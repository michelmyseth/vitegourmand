<template>
  <section aria-labelledby="orders-title">
    <h2 id="orders-title">Mes commandes</h2>

    <p v-if="loading" aria-busy="true">Chargement…</p>
    <p v-else-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <div v-else-if="!orders.length" class="panel">
      <p>Vous n'avez pas encore passé de commande.</p>
      <router-link to="/menus" class="btn">Découvrir nos menus</router-link>
    </div>

    <div v-else class="table-wrap">
      <table class="data-table">
        <caption class="sr-only">Liste de mes commandes</caption>
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Menu</th>
            <th scope="col">Prestation</th>
            <th scope="col">Personnes</th>
            <th scope="col">Total</th>
            <th scope="col">Statut</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td>{{ o.orderNumber }}</td>
            <td>{{ o.menuTitle }}</td>
            <td>{{ formatDate(o.date) }} à {{ o.time }}</td>
            <td>{{ o.people }}</td>
            <td>{{ euros(o.totalPrice) }}</td>
            <td><StatusBadge :status="o.status" /></td>
            <td>
              <router-link :to="`/account/orders/${o.id}`" class="link">
                Détail<span class="sr-only"> de la commande {{ o.orderNumber }}</span>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { api } from '@/services/http'
import { euros, formatDate } from '@/utils/format'

const orders = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    orders.value = await api('/api/orders')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
