<template>
  <div class="menus-page">
    <Header />
    <main>
      <section>
        <h2>Tous les menus</h2>

        <div class="filters">
          <div class="filter-row">
            <label>Prix maximum:
              <input type="number" v-model.number="qMaxPrice" placeholder="ex: 20" />
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
            <img :src="m.image || placeholder" alt="image menu" class="card-image"/>
            <div class="card-body">
              <h3>{{ m.title }}</h3>
              <p class="desc">{{ m.description }}</p>
              <div class="meta">
                <div><strong>Personnes min.:</strong> {{ m.minPeople }}</div>
                <div><strong>Prix:</strong> €{{ m.price }}</div>
                <div><strong>Thème:</strong> {{ m.theme }}</div>
                <div v-if="m.diet"><strong>Régime:</strong> {{ m.diet }}</div>
              </div>
              <div class="actions">
                <button @click="openDetails(m)">Voir détails</button>
                <button @click="handleOrder(m)" style="margin-left:8px">Commander</button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="detailMenu" class="modal" @click.self="closeDetails">
          <div class="modal-body">
            <img :src="detailMenu.image" alt="image menu" class="modal-image"/>
            <h3>{{ detailMenu.title }}</h3>
            <p>{{ detailMenu.description }}</p>
            <ul>
              <li>Personnes min.: {{ detailMenu.minPeople }}</li>
              <li>Prix: €{{ detailMenu.price }}</li>
              <li>Thème: {{ detailMenu.theme }}</li>
              <li v-if="detailMenu.diet">Régime: {{ detailMenu.diet }}</li>
            </ul>
            <div class="modal-actions">
              <button @click="closeDetails">Fermer</button>
              <button @click="handleOrder(detailMenu)" style="margin-left:8px">Commander</button>
            </div>
          </div>
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

type Menu = {
  id: number
  title: string
  description: string
  minPeople: number
  price: number
  theme: string
  image?: string
  diet?: string
}

// Mock data — replace by API call later
const menus = ref<Menu[]>([
  { id: 1, title: 'Menu Découverte', description: 'Entrée + Plat + Dessert', minPeople: 1, price: 15, theme: 'Traditionnel', diet: 'Omnivore', image: '/src/assets/img/couscous.jpg' },
  { id: 2, title: 'Menu Végétarien', description: 'Sélection végétarienne raffinée', minPeople: 2, price: 18, theme: 'Végétarien', diet: 'Végétarien', image: '/src/assets/img/couscous.jpg' },
  { id: 3, title: 'Menu Famille', description: 'Plats adaptés aux enfants', minPeople: 4, price: 12, theme: 'Famille', diet: 'Omnivore', image: '/src/assets/img/couscous.jpg' },
  { id: 4, title: 'Menu Santé', description: 'Options légères et équilibrées', minPeople: 1, price: 20, theme: 'Santé', diet: 'Sans Gluten', image: '/src/assets/img/couscous.jpg' },
  { id: 5, title: 'Menu Prestige', description: 'Menu gastronomique complet', minPeople: 2, price: 30, theme: 'Gastronomique', diet: 'Omnivore', image: '/src/assets/img/couscous.jpg' }
])

// Filter state
const qMaxPrice = ref<number | null>(null)
const qMinPrice = ref<number | null>(null)
const qMaxPriceRange = ref<number | null>(null)
const qTheme = ref<string>('')
const qDiet = ref<string>('')
const qMinPeople = ref<number | null>(null)

const themes = computed(() => Array.from(new Set(menus.value.map(m => m.theme))))
const diets = computed(() => Array.from(new Set(menus.value.map(m => m.diet || ''))).filter(Boolean))

const filtered = computed(() => {
  return menus.value.filter(m => {
    if (qMaxPrice.value != null && m.price > qMaxPrice.value) return false
    if (qMinPrice.value != null && qMaxPriceRange.value != null) {
      if (m.price < qMinPrice.value || m.price > qMaxPriceRange.value) return false
    }
    if (qTheme.value && m.theme !== qTheme.value) return false
    if (qDiet.value && (m.diet || '') !== qDiet.value) return false
    if (qMinPeople.value != null && m.minPeople < qMinPeople.value) return false
    return true
  })
})

// Modal details
const detailMenu = ref<Menu | null>(null)
function openDetails(m: Menu) { detailMenu.value = m }
function closeDetails() { detailMenu.value = null }

function handleOrder(m: Menu) {
  alert(`Commande du menu "${m.title}" pour €${m.price}`)
  // À remplacer par une vraie logique de commande/panier
}

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

.modal-image {
  width: 100%;
  height: auto;
  border-radius: 6px;
  margin-bottom: 12px;
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-body {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 480px;
  width: 100%;
}

.modal-body h3 {
  margin: 12px 0 8px;
  font-size: 1.3rem;
}

.modal-body p {
  margin: 0 0 12px;
  color: #555;
}

.modal-body ul {
  list-style: none;
  padding: 0;
  margin: 12px 0;
  font-size: 0.95rem;
}

.modal-body li {
  padding: 4px 0;
  color: #333;
}

.modal-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.modal-actions button:last-child {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
}
</style>