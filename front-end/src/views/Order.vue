<template>
  <div class="page-root">
    <Header />
    <main class="order container">
      <h1>Commander un menu</h1>

      <div v-if="step === 'done'" ref="doneEl" class="confirmed" role="status" tabindex="-1">
        <h2>Merci, votre commande {{ saved.orderNumber }} est enregistrée !</h2>
        <p>
          Total : <strong>{{ euros(saved.totalPrice) }}</strong>. Un email de confirmation vient de vous être envoyé.
          Vous pouvez la modifier ou l'annuler tant qu'elle n'a pas été acceptée par notre équipe.
        </p>
        <p class="done-links">
          <router-link :to="`/account/orders/${saved.id}`">Voir ma commande</router-link>
          <router-link to="/menus">Retour aux menus</router-link>
        </p>
      </div>

      <template v-else>
        <p v-if="loadError" class="alert alert-error" role="alert">{{ loadError }}</p>
        <p v-if="saveError" class="alert alert-error" role="alert">{{ saveError }}</p>

        <OrderSummary
          v-if="step === 'summary'"
          :order="{ ...customer, ...form }"
          :menu="menu"
          :address="address"
          :delivery="delivery"
          :price="price"
          :loading="saving"
          @back="step = 'form'"
          @confirm="confirm"
        />

        <form v-show="step === 'form'" novalidate @submit.prevent="submit">
          <OrderCustomerFields :customer="customer" />

          <fieldset class="order-fieldset">
            <legend>Votre menu</legend>
            <div class="grid-2">
              <div class="field">
                <label for="menu">Menu</label>
                <select id="menu" v-model.number="form.menuId" :aria-invalid="!!errors.menuId" aria-describedby="menu-err">
                  <option :value="null" disabled>Choisir un menu</option>
                  <option v-for="m in menus" :key="m.id" :value="m.id" :disabled="m.stock === 0">
                    {{ m.title }} — {{ euros(m.price) }} pour {{ m.minPeople }} pers.{{ m.stock === 0 ? ' (épuisé)' : '' }}
                  </option>
                </select>
                <p v-if="errors.menuId" id="menu-err" class="err">{{ errors.menuId }}</p>
              </div>
              <div class="field">
                <label for="people">Nombre de personnes</label>
                <input id="people" v-model.number="form.people" type="number" inputmode="numeric" :min="menu?.minPeople || 1" step="1" :aria-invalid="!!errors.people" aria-describedby="people-help people-err" />
                <p id="people-help" class="help">
                  <template v-if="menu">
                    Minimum {{ menu.minPeople }} personnes.
                    −10 % à partir de {{ menu.minPeople + 5 }} personnes.
                  </template>
                </p>
                <p v-if="errors.people" id="people-err" class="err">{{ errors.people }}</p>
              </div>
            </div>
            <p v-if="menu" class="conditions"><strong>Conditions :</strong> {{ menu.conditions }}</p>
          </fieldset>

          <fieldset class="order-fieldset">
            <legend>Votre événement</legend>
            <AddressAutocomplete v-model="address" placeholder="Ex. 12 avenue de la Marne, Mérignac" :error="errors.address">
              <template #help>{{ deliveryHelp }}</template>
            </AddressAutocomplete>
            <div class="grid-2">
              <div class="field">
                <label for="date">Date de la prestation</label>
                <input id="date" v-model="form.date" type="date" :min="minDate" :aria-invalid="!!errors.date" aria-describedby="date-err" />
                <p v-if="errors.date" id="date-err" class="err">{{ errors.date }}</p>
              </div>
              <div class="field">
                <label for="time">Heure de livraison</label>
                <input id="time" v-model="form.time" type="time" :aria-invalid="!!errors.time" aria-describedby="time-err" />
                <p v-if="errors.time" id="time-err" class="err">{{ errors.time }}</p>
              </div>
            </div>
            <div class="field">
              <label for="place">Précisions sur le lieu <span class="optional">(facultatif)</span></label>
              <textarea id="place" v-model.trim="form.place" rows="2" maxlength="300" placeholder="Salle, étage, digicode, accès…"></textarea>
            </div>
          </fieldset>

          <p v-if="price" class="total" aria-live="polite">
            Total estimé : <strong>{{ formatEuros(price.totalCents) }}</strong>
          </p>

          <button type="submit" class="submit">Continuer</button>
        </form>
      </template>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import OrderCustomerFields from '@/components/OrderCustomerFields.vue'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import { api } from '@/services/http'
import { euros } from '@/utils/format'
import { useAuth } from '@/composables/useAuth'
import { computeOrderPrice, formatEuros } from '@/utils/pricing'
import { deliveryDistance } from '@/services/geo'
import { focusFirstError } from '@/utils/validation'

const route = useRoute()
const { user, fetchUser } = useAuth()

const step = ref('form') // form -> summary -> done
const menus = ref([])
const loadError = ref('')
const saveError = ref('')
const saving = ref(false)
const saved = ref(null)
const doneEl = ref(null)

const customer = reactive({ lastName: '', firstName: '', email: '', phone: '' })
const form = reactive({ menuId: null, people: null, date: '', time: '', place: '' })
const errors = reactive({})

const getMenu = (id) => menus.value.find((m) => m.id === Number(id)) || null
const menu = computed(() => getMenu(form.menuId))

// When the menu changes, never keep a number of people below its minimum
watch(menu, (m) => {
  if (m && (!Number.isInteger(form.people) || form.people < m.minPeople)) form.people = m.minPeople
})

onMounted(async () => {
  // Customer details come from the logged-in account
  const u = user.value || (await fetchUser())
  if (u) Object.keys(customer).forEach((k) => (customer[k] = u[k] || ''))

  // Menus from the API; the menu chosen on the detail page is pre-selected (KAN-46)
  try {
    menus.value = await api('/api/menus')
    const initial = getMenu(route.query.menu)
    if (initial && initial.stock > 0) form.menuId = initial.id
  } catch (err) {
    loadError.value = err.message
  }
})

// Delivery address chosen in the autocomplete -> distance from Bordeaux
const address = ref(null)
const delivery = ref(null)
const distanceLoading = ref(false)

watch(address, async (a) => {
  delivery.value = null
  if (!a) return
  distanceLoading.value = true
  delivery.value = await deliveryDistance(a)
  distanceLoading.value = false
})

const deliveryHelp = computed(() => {
  if (distanceLoading.value) return 'Calcul de la distance…'
  if (!delivery.value) return 'Choisissez une adresse dans la liste proposée.'
  if (delivery.value.inBordeaux) return 'Livraison gratuite à Bordeaux.'
  return `${delivery.value.km} km depuis Bordeaux${delivery.value.method === 'straight' ? ' (à vol d’oiseau)' : ''}.`
})

// Tomorrow at the earliest
const minDate = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

// Estimate only: the server recomputes the price when the order is saved
const price = computed(() => {
  if (!menu.value || !delivery.value) return null
  if (!Number.isInteger(form.people) || form.people < menu.value.minPeople) return null
  return computeOrderPrice(menu.value, form.people, delivery.value)
})

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!menu.value) errors.menuId = 'Choisissez un menu.'
  else if (menu.value.stock === 0) errors.menuId = 'Ce menu n’est plus disponible.'
  if (menu.value && (!Number.isInteger(form.people) || form.people < menu.value.minPeople)) {
    errors.people = `Le nombre de personnes doit être d’au moins ${menu.value.minPeople}.`
  }
  if (!address.value) errors.address = 'Choisissez une adresse dans la liste.'
  if (!form.date || form.date < minDate) errors.date = 'Choisissez une date à partir de demain.'
  if (!form.time) errors.time = 'L’heure est obligatoire.'
  return Object.keys(errors).length === 0
}

function submit() {
  saveError.value = ''
  if (!validate()) return focusFirstError()
  step.value = 'summary'
  window.scrollTo({ top: 0 })
}

// KAN-51: the server recomputes the distance and the price, and checks the stock
async function confirm() {
  saveError.value = ''
  saving.value = true
  try {
    const { address: street, postcode, city } = address.value
    saved.value = await api('/api/orders', {
      method: 'POST',
      body: { ...form, address: street, postcode, city }
    })
    step.value = 'done'
    await nextTick()
    doneEl.value?.focus()
  } catch (err) {
    saveError.value = err.message
    Object.assign(errors, err.details)
    step.value = 'form'
    window.scrollTo({ top: 0 })
    // Stock may have changed: reload the menus
    menus.value = await api('/api/menus').catch(() => menus.value)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.order {
  flex: 1;
  padding: 32px 0 48px;
  max-width: 820px;
}

.order :deep(.order-fieldset) {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px 20px 8px;
  margin-bottom: 20px;
  background: var(--color-surface);
}

.order :deep(legend) {
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0 6px;
}

.optional {
  font-weight: normal;
  color: #616161;
}

.conditions {
  background: #fff3e0;
  border-left: 6px solid #e65100;
  padding: 8px 12px;
  margin-bottom: 14px;
  font-size: 0.95rem;
}

.total {
  font-size: 1.15rem;
  margin-bottom: 16px;
}

.submit {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  font-weight: bold;
}

.confirmed {
  background: var(--color-primary-light);
  border-left: 6px solid var(--color-primary);
  border-radius: 6px;
  padding: 20px;
}

.confirmed:focus {
  outline: none;
}

.done-links {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.confirmed a {
  color: var(--color-primary-dark);
  text-decoration: underline;
}
</style>
