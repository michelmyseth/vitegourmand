<script setup lang="ts">
import { computed, ref } from 'vue'
import { selectedMenuId } from '../stores/selection'
import { isAuthenticated } from '../stores/auth'

// For demo, local copy of menus (in a real app you'd fetch by id)
const menus = ref([
  { id: 1, title: 'Menu Découverte', description: 'Entrée + Plat + Dessert', minPeople: 1, price: 15, theme: 'Traditionnel', diet: 'Omnivore' },
  { id: 2, title: 'Menu Végétarien', description: 'Sélection végétarienne raffinée', minPeople: 2, price: 18, theme: 'Végétarien', diet: 'Végétarien' },
  { id: 3, title: 'Menu Famille', description: 'Plats adaptés aux enfants', minPeople: 4, price: 12, theme: 'Famille', diet: 'Omnivore' },
  { id: 4, title: 'Menu Santé', description: 'Options légères et équilibrées', minPeople: 1, price: 20, theme: 'Santé', diet: 'Sans Gluten' },
  { id: 5, title: 'Menu Prestige', description: 'Menu gastronomique complet', minPeople: 2, price: 30, theme: 'Gastronomique', diet: 'Omnivore' }
])

const selected = computed(() => menus.value.find(m => m.id === selectedMenuId.value) || null)
const qty = ref(1)
const orderMessage = ref('')

function placeOrder(){
  if (!isAuthenticated.value) {
    orderMessage.value = 'Vous devez être connecté pour passer commande.'
    return
  }
  if (!selected.value) {
    orderMessage.value = 'Aucun menu sélectionné.'
    return
  }
  // Simulate order placement
  orderMessage.value = `Commande enregistrée: ${selected.value.title} x${qty.value} — total €${(selected.value.price*qty.value).toFixed(2)}`
}
</script>

<template>
  <section>
    <h2>Passer commande</h2>
    <div v-if="!selected">
      <p>Aucun menu sélectionné pour la commande. Retournez à la liste des menus.</p>
    </div>

    <div v-else>
      <h3>{{ selected.title }}</h3>
      <p>{{ selected.description }}</p>
      <div><strong>Prix:</strong> €{{ selected.price }}</div>
      <div><strong>Personnes min.:</strong> {{ selected.minPeople }}</div>
      <div v-if="selected.diet"><strong>Régime:</strong> {{ selected.diet }}</div>

      <label style="display:block;margin-top:8px">Quantité
        <input type="number" v-model.number="qty" min="1" />
      </label>

      <div style="margin-top:12px">
        <button @click="placeOrder">Valider la commande</button>
      </div>

      <p v-if="orderMessage" style="margin-top:12px">{{ orderMessage }}</p>
    </div>
  </section>
</template>

<style scoped>
input{padding:6px;border:1px solid #ddd;border-radius:4px}
button{padding:8px 10px;border-radius:6px;border:1px solid #ddd;background:#fff}
</style>
