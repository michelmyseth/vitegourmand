<template>
  <dl class="details">
    <div v-if="showCustomer">
      <dt>Client</dt>
      <dd>
        {{ order.customerFirstName }} {{ order.customerLastName }}<br />
        <a :href="`mailto:${order.customerEmail}`" class="link">{{ order.customerEmail }}</a> —
        <a :href="`tel:${order.customerPhone}`" class="link">{{ order.customerPhone }}</a>
      </dd>
    </div>
    <div>
      <dt>Menu</dt>
      <dd>{{ order.menuTitle }}</dd>
    </div>
    <div>
      <dt>Personnes</dt>
      <dd>{{ order.people }}</dd>
    </div>
    <div>
      <dt>Prestation</dt>
      <dd>{{ formatDate(order.date) }} à {{ order.time }}</dd>
    </div>
    <div>
      <dt>Adresse</dt>
      <dd>{{ order.address }}, {{ order.postcode }} {{ order.city }}</dd>
    </div>
    <div v-if="order.place">
      <dt>Précisions</dt>
      <dd>{{ order.place }}</dd>
    </div>
    <div>
      <dt>Menu</dt>
      <dd>{{ euros(order.menuPrice) }}</dd>
    </div>
    <div v-if="order.discount">
      <dt>Réduction</dt>
      <dd>−{{ euros(order.discount) }}</dd>
    </div>
    <div>
      <dt>Livraison</dt>
      <dd>
        {{ order.deliveryPrice ? `${euros(order.deliveryPrice)} (${order.deliveryKm} km)` : 'Gratuite (Bordeaux)' }}
      </dd>
    </div>
    <div class="total">
      <dt>Total</dt>
      <dd>{{ euros(order.totalPrice) }}</dd>
    </div>
    <div>
      <dt>Passée le</dt>
      <dd>{{ formatDateTime(order.createdAt) }}</dd>
    </div>
    <div v-if="order.equipmentLoan">
      <dt>Matériel prêté</dt>
      <dd>{{ order.equipmentReturned ? 'Restitué' : 'À restituer sous 10 jours ouvrés (sinon 600 € de frais)' }}</dd>
    </div>
  </dl>
</template>

<script setup>
import { euros, formatDate, formatDateTime } from '@/utils/format'

defineProps({
  order: { type: Object, required: true },
  showCustomer: { type: Boolean, default: false }
})
</script>

<style scoped>
.details div {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-line);
}

.details dt {
  font-weight: bold;
}

.details dd {
  margin: 0;
}

.total {
  font-size: 1.1rem;
}

@media (max-width: 480px) {
  .details div {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
