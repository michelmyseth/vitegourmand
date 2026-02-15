<script setup lang="ts">
const reviews = [
  { id:1, author:'Alice', text:'Super service !', validated:true },
  { id:2, author:'Bob', text:'Très bon repas', validated:true },
  { id:3, author:'Eve', text:'En attente modération', validated:false }
]
</script>

<template>
  <section>
    <h2>Présentation de l'entreprise</h2>
    <p>ViteGourmand est une entreprise spécialisée dans la livraison de plats faits maison, alliant qualité et rapidité.</p>

    <h3>Professionnalisme de l'équipe</h3>
    <p>Notre équipe est composée de professionnels formés aux bonnes pratiques d'hygiène et au service client.</p>

    <h3>Avis clients (validés)</h3>
    <ul>
      <li v-for="r in reviews.filter(x => x.validated)" :key="r.id">
        <strong>{{ r.author }}:</strong> {{ r.text }}
      </li>
    </ul>

    <h3>Description du projet</h3>
    <p>Ce projet vise à proposer une application simple pour commander des plats locaux, avec une attention particulière portée à la conformité RGPD et à la sécurité des connexions.</p>
  </section>
</template>

<style scoped>
h2{margin-bottom:8px}
section p{margin:8px 0}
</style>
