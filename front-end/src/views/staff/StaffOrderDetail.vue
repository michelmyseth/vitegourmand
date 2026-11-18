<template>
  <section aria-labelledby="order-title">
    <router-link to="/employee/orders" class="link">← Toutes les commandes</router-link>

    <p v-if="loading" aria-busy="true">Chargement…</p>
    <p v-else-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <template v-else>
      <h2 id="order-title" class="title">
        Commande {{ order.orderNumber }} <StatusBadge :status="order.status" />
      </h2>
      <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>

      <div class="columns">
        <div>
          <div class="panel">
            <h3>Détail</h3>
            <OrderDetails :order="order" show-customer />
          </div>

          <!-- KAN-61: next status, each change is logged with date and time -->
          <div v-if="order.nextStatuses.length" class="panel">
            <h3>Faire avancer la commande</h3>
            <p v-if="statusError" class="alert alert-error" role="alert">{{ statusError }}</p>
            <div class="buttons">
              <button
                v-for="s in order.nextStatuses"
                :key="s"
                type="button"
                class="btn"
                :disabled="changing"
                @click="changeStatus(s)"
              >
                Passer à « {{ STATUS_LABELS[s] }} »
              </button>
            </div>
            <p v-if="order.status === 'delivered'" class="help">
              Choisissez « {{ STATUS_LABELS.awaiting_equipment_return }} » si du matériel a été prêté :
              le client est prévenu par email (restitution sous 10 jours ouvrés, sinon 600 € de frais).
            </p>
          </div>
        </div>
        <div class="panel">
          <h3>Historique</h3>
          <OrderTimeline :history="order.history" staff />
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
import OrderTimeline from '@/components/OrderTimeline.vue'
import { api } from '@/services/http'
import { STATUS_LABELS } from '@/utils/format'

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const error = ref('')
const message = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    order.value = await api(`/api/staff/orders/${encodeURIComponent(route.params.id)}`)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })

const changing = ref(false)
const statusError = ref('')

async function changeStatus(status) {
  statusError.value = ''
  message.value = ''
  changing.value = true
  try {
    order.value = await api(`/api/staff/orders/${order.value.id}/status`, { method: 'PUT', body: { status } })
    message.value = `Statut mis à jour : ${STATUS_LABELS[status]}.`
  } catch (err) {
    statusError.value = err.message
  } finally {
    changing.value = false
  }
}
</script>

<style scoped>
.title {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 16px;
}

.buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
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
