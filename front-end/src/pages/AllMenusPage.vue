<script setup lang="ts">
import { ref, computed } from 'vue'
import * as auth from '../stores/auth'
import { selectedMenuId } from '../stores/selection'

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
const placeholder = 'https://via.placeholder.com/320x180?text=Menu'
const menus = ref<Menu[]>([
  { id: 1, title: 'Menu Découverte', description: 'Entrée + Plat + Dessert', minPeople: 1, price: 15, theme: 'Traditionnel', diet: 'Omnivore', image: '/images/KEBAB.jpg' },
  { id: 2, title: 'Menu Végétarien', description: 'Sélection végétarienne raffinée', minPeople: 2, price: 18, theme: 'Végétarien', diet: 'Végétarien', image: placeholder + '+Végétarien' },
  { id: 3, title: 'Menu Famille', description: 'Plats adaptés aux enfants', minPeople: 4, price: 12, theme: 'Famille', diet: 'Omnivore', image: placeholder + '+Famille' },
  { id: 4, title: 'Menu Santé', description: 'Options légères et équilibrées', minPeople: 1, price: 20, theme: 'Santé', diet: 'Sans Gluten', image: placeholder + '+Santé' },
  { id: 5, title: 'Menu Prestige', description: 'Menu gastronomique complet', minPeople: 2, price: 30, theme: 'Gastronomique', diet: 'Omnivore', image: placeholder + '+Prestige' }
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
  // if authenticated, set selection and navigate to order
  if (auth.isAuthenticated.value) {
    selectedMenuId.value = m.id
    // use history/navigation via parent — emit an event instead
    // we assume parent listens to window.history in App.vue via navigate
    // but here we'll push state and also try to dispatch a custom event
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'order' } }))
  } else {
    // set pending redirect then navigate to login
    auth.pendingRedirect.value = { page: 'order', menuId: m.id }
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }))
  }
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

<template>
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
          <button @click="() => handleOrder(detailMenu)" @click.prevent="handleOrder(detailMenu)" style="margin-left:8px">Commander</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
section{padding:8px 0}
.filters{margin:12px 0}
.filter-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.filter-row label{display:flex;flex-direction:column;font-size:13px}
.filter-row input,.filter-row select{padding:6px;border:1px solid #ddd;border-radius:4px}
.filter-actions{display:flex;align-items:flex-end}
.filter-actions button{padding:6px 10px;border-radius:6px;border:1px solid #ddd;background:#fff}
.list{display:flex;flex-direction:column;gap:12px;margin-top:12px}
.card{border:1px solid #eee;padding:12px;border-radius:6px;background:#fff;display:flex;gap:12px;align-items:flex-start}
.card-body{flex:1}
.card h3{margin:0 0 6px}
.card .desc{margin:0 0 8px;color:#444}
.meta{display:flex;gap:16px;flex-wrap:wrap;font-size:14px;color:#333}
.actions{margin-top:10px}
.actions button{padding:6px 10px;border-radius:6px;border:1px solid #ddd;background:#fff}
.empty{color:#666}

.card-image{width:160px;height:100px;object-fit:cover;border-radius:6px}
.modal-image{width:100%;height:auto;border-radius:6px;margin-bottom:12px}

/* Simple modal */
.modal{position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;padding:20px}
.modal-body{background:#fff;padding:20px;border-radius:8px;max-width:480px;width:100%}
.modal-actions{margin-top:12px;text-align:right}
.modal-actions button{padding:6px 10px}
</style>
