<template>
  <section class="summary" aria-labelledby="summary-title">
    <h2 id="summary-title" ref="titleEl" tabindex="-1">Récapitulatif de votre commande</h2>

    <dl class="info">
      <div>
        <dt>Client</dt>
        <dd>{{ order.firstName }} {{ order.lastName }} — {{ order.email }} — {{ order.phone }}</dd>
      </div>
      <div>
        <dt>Menu</dt>
        <dd>{{ menu.title }}</dd>
      </div>
      <div>
        <dt>Personnes</dt>
        <dd>{{ order.people }}</dd>
      </div>
      <div>
        <dt>Livraison</dt>
        <dd>{{ formattedDate }} à {{ order.time }}<br />{{ address.label }}</dd>
      </div>
      <div v-if="order.place">
        <dt>Précisions</dt>
        <dd>{{ order.place }}</dd>
      </div>
    </dl>

    <table class="prices">
      <caption class="sr-only">
        Détail du prix
      </caption>
      <tbody>
        <tr>
          <th scope="row">Menu ({{ order.people }} × {{ formatEuros(price.pricePerPersonCents) }})</th>
          <td>{{ formatEuros(price.menuCents) }}</td>
        </tr>
        <tr v-if="price.hasDiscount" class="discount">
          <th scope="row">Réduction −10 % ({{ menu.minPeople + 5 }} personnes ou plus)</th>
          <td>−{{ formatEuros(price.discountCents) }}</td>
        </tr>
        <tr>
          <th scope="row">
            Livraison
            <span class="detail">
              {{ delivery.inBordeaux ? '(Bordeaux, offerte)' : `(5 € + 0,59 € × ${delivery.km} km)` }}
            </span>
          </th>
          <td>{{ price.deliveryCents ? formatEuros(price.deliveryCents) : 'Gratuite' }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total TTC</th>
          <td>{{ formatEuros(price.totalCents) }}</td>
        </tr>
      </tfoot>
    </table>

    <p class="conditions"><strong>Conditions du menu :</strong> {{ menu.conditions }}</p>

    <div class="actions">
      <button type="button" class="secondary" @click="$emit('back')">Modifier ma commande</button>
      <button type="button" class="primary" :disabled="loading" @click="$emit('confirm')">
        {{ loading ? 'Envoi…' : 'Valider la commande' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { formatEuros } from '@/utils/pricing'

const props = defineProps({
  order: { type: Object, required: true },
  menu: { type: Object, required: true },
  address: { type: Object, required: true },
  delivery: { type: Object, required: true },
  price: { type: Object, required: true },
  loading: { type: Boolean, default: false }
})
defineEmits(['back', 'confirm'])

const formattedDate = computed(() =>
  new Date(`${props.order.date}T00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
)

// Move keyboard / screen reader focus to the summary when it appears
const titleEl = ref(null)
onMounted(() => titleEl.value?.focus())
</script>

<style scoped>
.summary {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

.summary h2:focus {
  outline: none;
}

.info div {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-line);
}

.info dt {
  font-weight: bold;
}

.prices {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.prices th {
  text-align: left;
  font-weight: normal;
}

.prices th,
.prices td {
  padding: 8px 0;
  border-bottom: 1px solid var(--color-line);
}

.prices td {
  text-align: right;
  white-space: nowrap;
  padding-left: 12px;
}

.detail {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.discount {
  color: var(--color-primary-dark);
}

.prices tfoot th,
.prices tfoot td {
  font-weight: bold;
  font-size: 1.2rem;
  border-bottom: none;
  border-top: 2px solid var(--color-text);
}

.conditions {
  background: #fff3e0;
  border-left: 6px solid #e65100;
  padding: 8px 12px;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.actions button {
  flex: 1;
  min-width: 200px;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
}

.primary {
  background: var(--color-primary);
}

.primary:hover {
  background: var(--color-primary-dark);
}

.primary:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.secondary {
  background: #fff;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.secondary:hover {
  background: var(--color-primary-light);
}

button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .info div {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
