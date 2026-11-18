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
          <!-- KAN-54: tracking, every status with its date and time -->
          <div class="panel">
            <h3>Suivi de la commande</h3>
            <OrderTimeline :history="order.history" />
          </div>

          <!-- KAN-56: review of a completed order, once -->
          <div v-if="order.review" class="panel">
            <h3>Mon avis</h3>
            <p class="rating" :aria-label="`${order.review.rating} sur 5`">
              <span aria-hidden="true">{{ '★'.repeat(order.review.rating) }}{{ '☆'.repeat(5 - order.review.rating) }}</span>
            </p>
            <p>{{ order.review.comment }}</p>
            <p class="help">{{ REVIEW_STATUS[order.review.status] }}</p>
          </div>
          <div v-else-if="order.status === 'completed'" class="panel">
            <h3>Donnez votre avis</h3>
            <ReviewForm :order-id="order.id" @sent="onReview" />
          </div>

          <!-- KAN-53: edit / cancel while the order is not accepted -->
          <div v-if="order.status === 'pending'" class="panel">
            <h3>Modifier ou annuler</h3>
            <OrderEditForm
              v-if="editing"
              :order="order"
              :endpoint="`/api/orders/${order.id}`"
              @saved="onSaved"
              @cancel="editing = false"
            />
            <template v-else>
              <p class="help">Possible tant que la commande n'a pas été acceptée par notre équipe.</p>
              <div class="buttons">
                <button type="button" class="btn" @click="editing = true">Modifier la commande</button>
                <button type="button" class="btn btn-danger" :disabled="cancelling" @click="cancel">
                  {{ cancelling ? 'Annulation…' : 'Annuler la commande' }}
                </button>
              </div>
              <p v-if="actionError" class="alert alert-error" role="alert">{{ actionError }}</p>
            </template>
          </div>
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
import OrderEditForm from '@/components/OrderEditForm.vue'
import OrderTimeline from '@/components/OrderTimeline.vue'
import ReviewForm from '@/components/ReviewForm.vue'
import { api } from '@/services/http'

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const error = ref('')
const message = ref('')
const editing = ref(false)
const cancelling = ref(false)
const actionError = ref('')

const REVIEW_STATUS = {
  pending: 'En attente de validation par notre équipe.',
  approved: 'Publié sur la page d’accueil. Merci !',
  rejected: 'Non publié.'
}

function onReview(review) {
  order.value.review = review
  message.value = 'Merci pour votre avis ! Il sera publié après validation.'
}

async function onSaved() {
  editing.value = false
  await load()
  message.value = 'Votre commande a été modifiée.'
}

async function cancel() {
  if (!window.confirm(`Annuler la commande ${order.value.orderNumber} ? Cette action est définitive.`)) return
  actionError.value = ''
  cancelling.value = true
  try {
    await api(`/api/orders/${order.value.id}/cancel`, { method: 'POST' })
    await load()
    message.value = 'Votre commande a été annulée.'
  } catch (err) {
    actionError.value = err.message
  } finally {
    cancelling.value = false
  }
}

async function load() {
  loading.value = true
  error.value = ''
  message.value = ''
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

.rating {
  font-size: 1.4rem;
  color: #b26a00;
}

.buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 12px 0;
}

@media (max-width: 860px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
