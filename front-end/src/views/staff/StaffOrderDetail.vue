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

          <!-- KAN-62: edit / cancel after contacting the customer -->
          <div v-if="EDITABLE.includes(order.status)" class="panel">
            <h3>Modifier ou annuler</h3>
            <p class="help">Contactez d'abord le client par téléphone ou par email, puis indiquez le mode de contact et le motif.</p>

            <OrderEditForm
              v-if="mode === 'edit'"
              :order="order"
              :endpoint="`/api/staff/orders/${order.id}`"
              with-contact
              @saved="onEdited"
              @cancel="mode = ''"
            />

            <form v-else-if="mode === 'cancel'" novalidate @submit.prevent="cancelOrder">
              <p v-if="cancelError" class="alert alert-error" role="alert">{{ cancelError }}</p>
              <fieldset class="field contact">
                <legend class="label">Client contacté par</legend>
                <label class="inline"><input v-model="cancelForm.contactMethod" type="radio" value="phone" /> Téléphone</label>
                <label class="inline"><input v-model="cancelForm.contactMethod" type="radio" value="email" /> Email</label>
                <p v-if="cancelErrors.contactMethod" class="err">{{ cancelErrors.contactMethod }}</p>
              </fieldset>
              <div class="field">
                <label for="cancel-reason">Motif de l'annulation</label>
                <textarea id="cancel-reason" v-model.trim="cancelForm.reason" rows="3" maxlength="500" :aria-invalid="!!cancelErrors.reason"></textarea>
                <p v-if="cancelErrors.reason" class="err">{{ cancelErrors.reason }}</p>
              </div>
              <div class="buttons">
                <button type="button" class="btn btn-secondary" @click="mode = ''">Retour</button>
                <button type="submit" class="btn btn-danger" :disabled="changing">Confirmer l'annulation</button>
              </div>
            </form>

            <div v-else class="buttons">
              <button type="button" class="btn" @click="mode = 'edit'">Modifier la commande</button>
              <button type="button" class="btn btn-danger" @click="openCancel">Annuler la commande</button>
            </div>
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
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import OrderDetails from '@/components/OrderDetails.vue'
import OrderTimeline from '@/components/OrderTimeline.vue'
import OrderEditForm from '@/components/OrderEditForm.vue'
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

const EDITABLE = ['pending', 'accepted', 'preparing']
const mode = ref('') // '' | 'edit' | 'cancel'
const cancelForm = reactive({ contactMethod: '', reason: '' })
const cancelErrors = reactive({})
const cancelError = ref('')

function onEdited(updated) {
  order.value = { ...updated }
  mode.value = ''
  message.value = 'Commande modifiée. Le prix a été recalculé.'
}

function openCancel() {
  Object.assign(cancelForm, { contactMethod: '', reason: '' })
  Object.keys(cancelErrors).forEach((k) => delete cancelErrors[k])
  cancelError.value = ''
  mode.value = 'cancel'
}

async function cancelOrder() {
  Object.keys(cancelErrors).forEach((k) => delete cancelErrors[k])
  cancelError.value = ''
  if (!cancelForm.contactMethod) cancelErrors.contactMethod = 'Indiquez comment le client a été contacté.'
  if (!cancelForm.reason) cancelErrors.reason = 'Le motif est obligatoire.'
  if (Object.keys(cancelErrors).length) return
  changing.value = true
  try {
    order.value = await api(`/api/staff/orders/${order.value.id}/cancel`, { method: 'POST', body: { ...cancelForm } })
    mode.value = ''
    message.value = 'Commande annulée. Le menu a été remis en stock.'
  } catch (err) {
    cancelError.value = err.message
    Object.assign(cancelErrors, err.details)
  } finally {
    changing.value = false
  }
}

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

fieldset.contact {
  border: none;
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
