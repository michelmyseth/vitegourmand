<template>
  <div class="menus-page">
    <Header />
    <main>
      <section>
        <h2>Tous les menus</h2>

        <div class="filters">
          <div class="filter-row">
            <label>Prix maximum:
              <input type="number" v-model.number="qMaxPrice" placeholder="ex: 100" />
            </label>

            <label>Fourchette prix:
              <input type="number" v-model.number="qMinPrice" placeholder="min" />
              —
              <input type="number" v-model.number="qMaxPriceRange" placeholder="max" />
            </label>

            <label>Thème:
              <select v-model="qTheme">
                <option value="">Tous</option>
                <option v-for="t in themes" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>

            <label>Régime:
              <select v-model="qDiet">
                <option value="">Tous</option>
                <option v-for="d in diets" :key="d" :value="d">{{ d }}</option>
              </select>
            </label>

            <label>Nombre min:
              <input type="number" v-model.number="qMinPeople" min="1" />
            </label>

            <div class="filter-actions">
              <button @click="resetFilters">Réinitialiser</button>
            </div>
          </div>
        </div>

        <div class="list">
          <div v-if="filtered.length === 0" class="empty">Aucun menu trouvé.</div>
          <article v-for="m in filtered" :key="m.id" class="card">
            <img :src="m.images[0]" alt="" class="card-image"/>
            <div class="card-body">
              <h3>{{ m.title }}</h3>
              <p class="desc">{{ m.description }}</p>
              <div class="meta">
                <div><strong>Personnes min.:</strong> {{ m.minPeople }}</div>
                <div><strong>Prix:</strong> {{ m.price }} €</div>
                <div><strong>Thème:</strong> {{ m.theme }}</div>
                <div v-if="m.diet"><strong>Régime:</strong> {{ m.diet }}</div>
              </div>
              <div class="actions">
                <router-link :to="`/menus/${m.id}`" class="detail-link">Voir le détail<span class="sr-only"> du {{ m.title }}</span></router-link>
              </div>
            </div>
          </article>
        </div>

      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

import { menus as menuData } from '@/data/menus'

const menus = ref(menuData)

// Filter state
const qMaxPrice = ref<number | null>(null)
const qMinPrice = ref<number | null>(null)
const qMaxPriceRange = ref<number | null>(null)
const qTheme = ref<string>('')
const qDiet = ref<string>('')
const qMinPeople = ref<number | null>(null)

const themes = computed(() => Array.from(new Set(menus.value.map(m => m.theme))))
const diets = computed(() => Array.from(new Set(menus.value.map(m => m.diet || ''))).filter(Boolean))

// An emptied number input gives '' (not null) with v-model.number
const isSet = (v: number | string | null) => v !== null && v !== ''

const filtered = computed(() => {
  return menus.value.filter(m => {
    if (isSet(qMaxPrice.value) && m.price > qMaxPrice.value!) return false
    if (isSet(qMinPrice.value) && m.price < qMinPrice.value!) return false
    if (isSet(qMaxPriceRange.value) && m.price > qMaxPriceRange.value!) return false
    if (qTheme.value && m.theme !== qTheme.value) return false
    if (qDiet.value && (m.diet || '') !== qDiet.value) return false
    if (isSet(qMinPeople.value) && m.minPeople < qMinPeople.value!) return false
    return true
  })
})

function resetFilters() {
  qMaxPrice.value = null
  qMinPrice.value = null
  qMaxPriceRange.value = null
  qTheme.value = ''
  qDiet.value = ''
  qMinPeople.value = null
}
</script>

<style scoped>
.menus-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

main {
  flex: 1;
  padding: 32px 24px;
}

section {
  padding: 8px 0;
}

section h2 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
}

.filters {
  margin: 12px 0;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.filter-row label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  font-weight: 500;
}

.filter-row input, .filter-row select {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.filter-actions button {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.card {
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 6px;
  background: #fff;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.card-body {
  flex: 1;
}

.card h3 {
  margin: 0 0 6px;
  font-size: 1.1rem;
}

.card .desc {
  margin: 0 0 8px;
  color: #444;
  font-size: 0.95rem;
}

.meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.actions {
  margin-top: 10px;
}

.actions button {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.empty {
  color: #666;
  text-align: center;
  padding: 32px;
}

.card-image {
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.detail-link {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  background: #2e7d32;
  color: #fff;
  font-weight: 600;
}

.detail-link:hover {
  background: #1b5e20;
}

.detail-link:focus-visible {
  outline: 3px solid #1565c0;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .card {
    flex-direction: column;
  }

  .card-image {
    width: 100%;
    height: 160px;
  }
}
</style>