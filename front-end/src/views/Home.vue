<template>
  <div class="page-root">
    <Header />
    <section class="presentation">
      <div class="container">
        <h3>Professionnalisme de l'équipe</h3>
        <p>Notre équipe est composée de professionnels formés aux bonnes pratiques de sécurité routière et au service client.</p>

        <h3>Avis clients (validés)</h3>
        <ul class="reviews-list">
          <li v-for="r in reviews.filter(x => x.validated)" :key="r.id" class="review-item">
            <strong>{{ r.author }}:</strong> {{ r.text }}
          </li>
        </ul>

        <h3>À propos du projet</h3>
        <p>Ce projet vise à proposer une application simple et efficace pour organiser des trajets en covoiturage, avec une attention particulière portée à la conformité RGPD et à la sécurité des connexions.</p>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import covoitImg from '@/assets/img/Covoit.jpg'

const filters = ref({ from: '', to: '', date: '', electric: false, lowPrice: false, fast: false, minRating: 0 })

const trips = ref([
  { id:1, driver:{name:'Julien',avatar:'...'}, from:'Lyon', to:'Grenoble', date:'2024-09-02', duration:'1h20', seats:3, price:12, rating:4.8, type:'Électrique', carImage:'...' },
  { id:2, driver:{name:'Amélie',avatar:'...'}, from:'Lyon', to:'Chambéry', date:'2024-09-02', duration:'1h40', seats:2, price:9, rating:4.5, type:'Hybride', carImage:'...' }
])

const filteredTrips = computed(() => trips.value)

const reviews = [
  { id:1, author:'Alice', text:'Super service !', validated:true },
  { id:2, author:'Bob', text:'Très bon repas', validated:true },
  { id:3, author:'Eve', text:'En attente modération', validated:false }
]

function onSearch(){ console.log(filters.value) }
function book(trip){ alert(`Réservé: ${trip.from} → ${trip.to}`) }
</script>

<style>
.page-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
  gap: 2rem;
}

.hero-inner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.main-content-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0; /* ou 24px si tu veux un petit espace */
  width: 100%;
}

.side-image {
  flex: 1;
  max-width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.side-image img {
  max-width: 80%; /* ou 100% selon le rendu souhaité */
  height: auto;
  border-radius: 12px;
}

.infopanel-center {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40%;
  background: #f5f5f5;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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