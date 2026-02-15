<script setup lang="ts">
const contact = {
  address: '12 rue de la Fourchette, 75000 Paris',
  phone: '+33 1 23 45 67 89',
  email: 'contact@vitegourmand.example'
}
</script>

<template>
  <section>
    <h2>Contact</h2>
    <p><strong>Adresse :</strong> {{ contact.address }}</p>
    <p><strong>Téléphone :</strong> {{ contact.phone }}</p>
    <p><strong>Email :</strong> {{ contact.email }}</p>

    <h3>Formulaire</h3>
    <p>Formulaire de contact simplifié (prototype) — pour le déploiement, implémenter une validation et stockage conforme RGPD.</p>
  </section>
</template>

<style scoped>
section p{margin:6px 0}
</style>
