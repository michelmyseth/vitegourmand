<template>
  <div class="page-root">
    <Header />
    <section class="presentation">
      <div class="container">
        <h2>Vite &amp; Gourmand</h2>
        <p>
          Depuis 25 ans à Bordeaux, Julie et José imaginent et préparent des menus pour tous vos événements : repas de
          Noël, Pâques, fêtes de famille ou réceptions. Nos menus évoluent au fil des saisons.
        </p>

        <h3>Professionnalisme de l'équipe</h3>
        <p>
          Notre équipe met son savoir-faire au service de chaque prestation : produits frais, respect des règles
          d'hygiène et de conservation, livraison soignée et écoute de vos besoins.
        </p>

        <h3>Avis clients</h3>
        <p v-if="!reviews.length" class="no-reviews">Les avis de nos clients arrivent bientôt.</p>
        <ul v-else class="reviews-list">
          <li v-for="r in reviews" :key="r.id" class="review-item">
            <p class="stars" :aria-label="`Note : ${r.rating} sur 5`">
              <span aria-hidden="true">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
            </p>
            <blockquote>{{ r.comment }}</blockquote>
            <p class="author">{{ r.author }} — {{ r.menuTitle }}</p>
          </li>
        </ul>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/services/http'

// Approved reviews only (moderated by the employees, KAN-63)
const reviews = ref([])
onMounted(async () => {
  reviews.value = await api('/api/reviews').catch(() => [])
})
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
  background: var(--color-bg);
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
  color: var(--color-text);
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
  color: var(--color-text-muted);
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
  border-left: 4px solid var(--color-primary);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  color: var(--color-text-muted);
}

.review-item .stars {
  color: #b26a00;
  margin: 0;
}

.review-item blockquote {
  font-style: italic;
  color: var(--color-text);
}

.review-item .author {
  margin: 4px 0 0;
  font-size: 0.9rem;
}

.review-item strong {
  color: var(--color-primary);
}
</style>
