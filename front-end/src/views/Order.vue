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

      <p v-if="loadError" class="alert alert-error" role="alert">{{ loadError }}</p>
      <p v-if="saveError" class="alert alert-error" role="alert">{{ saveError }}</p>

      <OrderSummary
        v-else-if="step === 'summary'"
        :order="form"
        :menu="menu"
        :address="address"
        :delivery="delivery"
        :price="price"
        :loading="saving"
        @back="step = 'form'"
        @confirm="confirm"
      />

      <form v-show="step === 'form'" class="order-form" novalidate @submit.prevent="submit">
        <!-- Customer -->
        <fieldset>
          <legend>Vos coordonnées</legend>
          <p class="help">Informations de votre compte. <router-link to="/account/profile" class="link">Les modifier</router-link></p>
          <div class="grid">
            <div class="field">
              <label for="lastName">Nom</label>
              <input id="lastName" v-model.trim="form.lastName" readonly autocomplete="family-name" :aria-invalid="!!errors.lastName" aria-describedby="lastName-err" />
              <p v-if="errors.lastName" id="lastName-err" class="err">{{ errors.lastName }}</p>
            </div>
            <div class="field">
              <label for="firstName">Prénom</label>
              <input id="firstName" v-model.trim="form.firstName" readonly autocomplete="given-name" :aria-invalid="!!errors.firstName" aria-describedby="firstName-err" />
              <p v-if="errors.firstName" id="firstName-err" class="err">{{ errors.firstName }}</p>
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" v-model.trim="form.email" readonly type="email" autocomplete="email" :aria-invalid="!!errors.email" aria-describedby="email-err" />
              <p v-if="errors.email" id="email-err" class="err">{{ errors.email }}</p>
            </div>
            <div class="field">
              <label for="phone">Téléphone portable</label>
              <input id="phone" v-model.trim="form.phone" readonly type="tel" autocomplete="tel" placeholder="06 12 34 56 78" :aria-invalid="!!errors.phone" aria-describedby="phone-err" />
              <p v-if="errors.phone" id="phone-err" class="err">{{ errors.phone }}</p>
            </div>
          </div>
        </fieldset>

        <!-- Menu -->
        <fieldset>
          <legend>Votre menu</legend>
          <div class="grid">
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

        <!-- Event -->
        <fieldset>
          <legend>Votre événement</legend>
          <div class="field address">
            <label for="address">Adresse de l'événement</label>
            <input
              id="address"
              v-model="addressQuery"
              autocomplete="off"
              placeholder="Ex. 12 avenue de la Marne, Mérignac"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="suggestions.length > 0"
              aria-controls="address-list"
              :aria-invalid="!!errors.address"
              aria-describedby="address-help address-err"
              @input="onAddressInput"
            />
            <ul v-if="suggestions.length" id="address-list" role="listbox" class="suggestions">
              <li v-for="s in suggestions" :key="s.label" role="option" :aria-selected="false">
                <button type="button" @click="pickAddress(s)">{{ s.label }}</button>
              </li>
            </ul>
            <p id="address-help" class="help" aria-live="polite">
              <template v-if="distanceLoading">Calcul de la distance…</template>
              <template v-else-if="delivery && delivery.inBordeaux">Livraison gratuite à Bordeaux.</template>
              <template v-else-if="delivery">
                {{ delivery.km }} km depuis Bordeaux{{ delivery.method === 'straight' ? ' (à vol d’oiseau)' : '' }}.
              </template>
              <template v-else>Choisissez une adresse dans la liste proposée.</template>
            </p>
            <p v-if="errors.address" id="address-err" class="err">{{ errors.address }}</p>
          </div>
          <div class="grid">
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
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { nextTick } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import { api } from '@/services/http'
import { euros } from '@/utils/format'
import { useAuth } from '@/composables/useAuth'
import { computeOrderPrice, formatEuros } from '@/utils/pricing'
import { searchAddress, deliveryDistance } from '@/services/geo'

const route = useRoute()
const { user, fetchUser } = useAuth()

const menus = ref([])
const loadError = ref('')
const saveError = ref('')
const saving = ref(false)
const saved = ref(null)
const doneEl = ref(null)
const getMenu = (id) => menus.value.find((m) => m.id === Number(id)) || null

const form = reactive({
  lastName: '',
  firstName: '',
  email: '',
  phone: '',
  menuId: null,
  people: null,
  date: '',
  time: '',
  place: ''
})
const errors = reactive({})
const step = ref('form') // form -> summary -> done

const menu = computed(() => getMenu(form.menuId))

// When the menu changes, never keep a number of people below its minimum
watch(menu, (m) => {
  if (m && (!Number.isInteger(form.people) || form.people < m.minPeople)) form.people = m.minPeople
})

// Menus from the API; the menu chosen on the detail page is pre-selected (KAN-46)
onMounted(async () => {
  try {
    menus.value = await api('/api/menus')
    const initial = getMenu(route.query.menu)
    if (initial && initial.stock > 0) {
      form.menuId = initial.id
      form.people = initial.minPeople
    }
  } catch (err) {
    loadError.value = err.message
  }
})

// Pre-fill customer info from the logged-in account
onMounted(async () => {
  const u = user.value || (await fetchUser())
  if (!u) return
  form.lastName ||= u.lastName || ''
  form.firstName ||= u.firstName || ''
  form.email ||= u.email || ''
  form.phone ||= u.phone || ''
})

// Delivery address: autocomplete + distance
const addressQuery = ref('')
const suggestions = ref([])
const address = ref(null)
const delivery = ref(null)
const distanceLoading = ref(false)
let debounce

function onAddressInput() {
  address.value = null
  delivery.value = null
  clearTimeout(debounce)
  debounce = setTimeout(async () => {
    try {
      suggestions.value = await searchAddress(addressQuery.value)
    } catch {
      suggestions.value = []
    }
  }, 300)
}

async function pickAddress(s) {
  address.value = s
  addressQuery.value = s.label
  suggestions.value = []
  distanceLoading.value = true
  delivery.value = await deliveryDistance(s)
  distanceLoading.value = false
}

// Tomorrow at the earliest
const minDate = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

const price = computed(() => {
  if (!menu.value || !delivery.value) return null
  if (!Number.isInteger(form.people) || form.people < menu.value.minPeople) return null
  return computeOrderPrice(menu.value, form.people, delivery.value)
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(?:\+33\s?|0)[67](?:[\s.-]?\d{2}){4}$/

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.lastName) errors.lastName = 'Le nom est obligatoire.'
  if (!form.firstName) errors.firstName = 'Le prénom est obligatoire.'
  if (!EMAIL_RE.test(form.email)) errors.email = 'Adresse email invalide.'
  if (!PHONE_RE.test(form.phone)) errors.phone = 'Numéro de portable invalide (ex. 06 12 34 56 78).'
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
  if (!validate()) {
    const first = document.querySelector('[aria-invalid="true"]')
    first?.focus()
    return
  }
  step.value = 'summary'
  window.scrollTo({ top: 0 })
}

// KAN-51: the server recomputes the distance and the price, and checks the stock
async function confirm() {
  saveError.value = ''
  saving.value = true
  try {
    saved.value = await api('/api/orders', {
      method: 'POST',
      body: {
        menuId: form.menuId,
        people: form.people,
        address: address.value.street,
        postcode: address.value.postcode,
        city: address.value.city,
        date: form.date,
        time: form.time,
        place: form.place
      }
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
.page-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.order {
  flex: 1;
  padding: 32px 0 48px;
  max-width: 820px;
}

fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px 20px 8px;
  margin-bottom: 20px;
  background: #fff;
}

legend {
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0 6px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;
}

.field {
  margin-bottom: 14px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
}

.optional {
  font-weight: normal;
  color: #616161;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #757575;
  border-radius: 4px;
  font: inherit;
  background: #fff;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible,
button:focus-visible {
  outline: 3px solid #1565c0;
  outline-offset: 2px;
}

[aria-invalid='true'] {
  border-color: #c62828;
}

.err {
  color: #c62828;
  font-size: 0.9rem;
  margin-top: 4px;
}

.help {
  color: #555;
  font-size: 0.9rem;
  margin-top: 4px;
}

.conditions {
  background: #fff3e0;
  border-left: 6px solid #e65100;
  padding: 8px 12px;
  margin-bottom: 14px;
  font-size: 0.95rem;
}

.address {
  position: relative;
}

.suggestions {
  list-style: none;
  border: 1px solid #757575;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background: #fff;
}

.suggestions button {
  width: 100%;
  text-align: left;
  background: none;
  color: #333;
  border-radius: 0;
  padding: 8px 10px;
}

.suggestions button:hover,
.suggestions button:focus-visible {
  background: #e8f5e9;
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
  background: #2e7d32;
}

.submit:hover {
  background: #1b5e20;
}

.confirmed {
  background: #e8f5e9;
  border-left: 6px solid #2e7d32;
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

input[readonly] {
  background: #f5f5f5;
}

.confirmed a {
  color: #1b5e20;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
