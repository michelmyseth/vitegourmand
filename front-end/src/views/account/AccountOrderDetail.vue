<template>
  <section aria-labelledby="order-title">
    <router-link to="/account" class="link">← Mes commandes</router-link>

    <p v-if="loading" aria-busy="true">Chargement…</p>
    <p v-else-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <template v-else>
      <h2 id="order-title" class="title">
        Commande {{ order.orderNumber }} <StatusBadge :status="order.status" />
      </h2>
      <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>

      <div class="columns">
        <div class="panel">
          <h3>Détail</h3>
          <OrderDetails :order="order" />
        </div>

        <div class="side">
          <!-- KAN-53 edit / cancel, KAN-54 tracking, KAN-56 review -->
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import OrderDetails from '@/components/OrderDetails.vue'
import { api } from '@/services/http'

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const error = ref('')
const message = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    order.value = await api(`/api/orders/${encodeURIComponent(route.params.id)}`)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.title {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 16px;
}

.columns {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 860px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
