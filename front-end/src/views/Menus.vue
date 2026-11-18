<template>
  <div class="menus-page">
    <Header />
    <main>
      <section>
        <h2>Tous les menus</h2>

        <div class="filters">
          <div class="filter-row">
            <label>Prix maximum (€)
              <input v-model.number="f.maxPrice" type="number" min="0" placeholder="ex : 100" />
            </label>

            <fieldset class="range">
              <legend>Fourchette de prix (€)</legend>
              <label><span class="sr-only">Prix minimum</span>
                <input v-model.number="f.minPrice" type="number" min="0" placeholder="min" />
              </label>
              <span aria-hidden="true">—</span>
              <label><span class="sr-only">Prix maximum de la fourchette</span>
                <input v-model.number="f.rangeMax" type="number" min="0" placeholder="max" />
              </label>
            </fieldset>

            <label>Thème
              <select v-model="f.theme">
                <option value="">Tous</option>
                <option v-for="t in themes" :key="t.id" :value="t.id">{{ t.label }}</option>
              </select>
            </label>

            <label>Régime
              <select v-model="f.diet">
                <option value="">Tous</option>
                <option v-for="d in diets" :key="d.id" :value="d.id">{{ d.label }}</option>
              </select>
            </label>

            <label>Personnes minimum
              <input v-model.number="f.minPeople" type="number" min="1" />
            </label>

            <div class="filter-actions">
              <button type="button" @click="resetFilters">Réinitialiser</button>
            </div>
          </div>
        </div>

        <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
        <p class="sr-only" aria-live="polite">{{ loading ? 'Chargement des menus…' : `${menus.length} menu(s) trouvé(s)` }}</p>

        <div class="list" :aria-busy="loading">
          <div v-if="!loading && !error && menus.length === 0" class="empty">Aucun menu ne correspond à ces filtres.</div>
          <article v-for="m in menus" :key="m.id" class="card">
            <img :src="imageUrl(m.image)" alt="" class="card-image" />
            <div class="card-body">
              <h3>{{ m.title }}</h3>
              <p class="desc">{{ m.description }}</p>
              <div class="meta">
                <div><strong>Personnes min. :</strong> {{ m.minPeople }}</div>
                <div><strong>Prix :</strong> {{ euros(m.price) }}</div>
                <div><strong>Thème :</strong> {{ m.theme }}</div>
                <div><strong>Régime :</strong> {{ m.diet }}</div>
                <div v-if="m.stock === 0" class="sold-out">Épuisé</div>
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

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/services/http'
import { imageUrl, euros } from '@/utils/format'

const menus = ref([])
const themes = ref([])
const diets = ref([])
const loading = ref(true)
const error = ref('')

const emptyFilters = { maxPrice: '', minPrice: '', rangeMax: '', theme: '', diet: '', minPeople: '' }
const f = reactive({ ...emptyFilters })

// "Prix maximum" and the max of the range both cap the price: keep the lowest
function maxPrice() {
  const values = [f.maxPrice, f.rangeMax].filter((v) => v !== '' && v !== null)
  return values.length ? Math.min(...values) : ''
}

// Filtering is done by the API, without reloading the page (KAN-44)
let requestId = 0
async function load() {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const result = await api('/api/menus', {
      query: { maxPrice: maxPrice(), minPrice: f.minPrice, theme: f.theme, diet: f.diet, minPeople: f.minPeople }
    })
    if (id === requestId) menus.value = result // ignore answers to older requests
  } catch (err) {
    if (id === requestId) error.value = err.message
  } finally {
    if (id === requestId) loading.value = false
  }
}

let debounce
watch(f, () => {
  clearTimeout(debounce)
  debounce = setTimeout(load, 300)
})

onMounted(async () => {
  load()
  try {
    ;[themes.value, diets.value] = await Promise.all([api('/api/themes'), api('/api/diets')])
  } catch {
    // the filters stay usable without the lists
  }
})

function resetFilters() {
  Object.assign(f, emptyFilters)
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

.range {
  border: none;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.range legend {
  padding: 0;
}

.range input {
  width: 80px;
}

.sold-out {
  color: #b71c1c;
  font-weight: 600;
}

.filter-row input, .filter-row select {
  padding: 6px;
  border: 1px solid var(--color-border);
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
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text);
  cursor: pointer;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.card {
  border: 1px solid var(--color-line);
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
  color: var(--color-text);
  margin-bottom: 8px;
}

.actions {
  margin-top: 10px;
}

.actions button {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text);
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
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}

.detail-link:hover {
  background: var(--color-primary-dark);
}

.detail-link:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
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