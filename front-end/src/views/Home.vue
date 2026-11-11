<template>
  <div class="page-root">
    <Header />
    <section class="presentation">
      <div class="container">
        <h2>Vite &amp; Gourmand</h2>
        <p>Depuis 25 ans à Bordeaux, Julie et José imaginent et préparent des menus pour tous vos événements : repas de Noël, Pâques, fêtes de famille ou réceptions. Nos menus évoluent au fil des saisons.</p>

        <h3>Professionnalisme de l'équipe</h3>
        <p>Notre équipe met son savoir-faire au service de chaque prestation : produits frais, respect des règles d'hygiène et de conservation, livraison soignée et écoute de vos besoins.</p>

        <h3>Avis clients</h3>
        <ul class="reviews-list">
          <li v-for="r in reviews.filter(x => x.validated)" :key="r.id" class="review-item">
            <strong>{{ r.author }}:</strong> {{ r.text }}
          </li>
        </ul>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

// Mock data — replace by API call later (approved reviews only)
const reviews = [
  { id:1, author:'Alice', text:'Super service !', validated:true },
  { id:2, author:'Bob', text:'Très bon repas', validated:true },
  { id:3, author:'Eve', text:'En attente modération', validated:false }
]
</script>

<style>
.page-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
  gap: 2rem;
}

.presentation {
  background: #f9f9f9;
  padding: 48px 0;
  margin-top: 32px;
}

.presentation .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.presentation h2 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.presentation h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #444;
}

.presentation p {
  margin: 12px 0;
  line-height: 1.6;
  color: #555;
  font-size: 1rem;
}

.reviews-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 24px;
}

.review-item {
  background: #fff;
  padding: 12px 16px;
  margin: 8px 0;
  border-left: 4px solid #4caf50;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  color: #555;
}

.review-item strong {
  color: #4caf50;
}
</style>
