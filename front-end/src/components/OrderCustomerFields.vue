<template>
  <!-- Read-only: the order is placed with the account details (changed in "Mon compte") -->
  <fieldset class="order-fieldset">
    <legend>Vos coordonnées</legend>
    <p class="help">
      Informations de votre compte. <router-link to="/account/profile" class="link">Les modifier</router-link>
    </p>
    <div class="grid-2">
      <div v-for="f in FIELDS" :key="f.key" class="field">
        <label :for="`customer-${f.key}`">{{ f.label }}</label>
        <input :id="`customer-${f.key}`" :value="customer[f.key]" :type="f.type" :autocomplete="f.autocomplete" readonly />
      </div>
    </div>
  </fieldset>
</template>

<script setup>
defineProps({
  // { lastName, firstName, email, phone }
  customer: { type: Object, required: true }
})

const FIELDS = [
  { key: 'lastName', label: 'Nom', type: 'text', autocomplete: 'family-name' },
  { key: 'firstName', label: 'Prénom', type: 'text', autocomplete: 'given-name' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  { key: 'phone', label: 'Téléphone portable', type: 'tel', autocomplete: 'tel' }
]
</script>

<style scoped>
input[readonly] {
  background: #f5f5f5;
}
</style>
