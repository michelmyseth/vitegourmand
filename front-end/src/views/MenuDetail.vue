<template>
  <div class="page-root">
    <Header />
    <main class="menu-detail container">
      <router-link to="/menus" class="back-link">← Retour aux menus</router-link>

      <p v-if="loading" class="not-found" aria-busy="true">Chargement du menu…</p>
      <p v-else-if="!menu" class="not-found">{{ error || "Ce menu n'existe pas." }}</p>

      <article v-else>
        <h1>{{ menu.title }}</h1>
        <ul class="badges" aria-label="Caractéristiques du menu">
          <li>Thème : {{ menu.theme }}</li>
          <li>Régime : {{ menu.diet }}</li>
        </ul>

        <div class="top">
          <section class="gallery" aria-label="Galerie d'images">
            <img :src="imageUrl(menu.images[current]?.url)" :alt="menu.images[current]?.alt || `${menu.title} — photo ${current + 1} sur ${menu.images.length}`" class="gallery-main" />
            <div v-if="menu.images.length > 1" class="thumbs">
              <button
                v-for="(img, i) in menu.images"
                :key="img.id"
                type="button"
                class="thumb"
                :class="{ active: i === current }"
                :aria-label="`Afficher la photo ${i + 1}`"
                :aria-pressed="i === current"
                @click="current = i"
              >
                <img :src="imageUrl(img.url)" alt="" />
              </button>
            </div>
          </section>

          <section class="summary" aria-label="Résumé et commande">
            <p class="desc">{{ menu.description }}</p>

            <dl class="facts">
              <div><dt>Prix</dt><dd>{{ euros(menu.price) }} pour {{ menu.minPeople }} personnes</dd></div>
              <div><dt>Minimum</dt><dd>{{ menu.minPeople }} personnes</dd></div>
              <div>
                <dt>Disponibilité</dt>
                <dd :class="{ 'out-of-stock': menu.stock === 0 }">
                  {{ menu.stock > 0 ? `${menu.stock} commande(s) encore possible(s)` : 'Plus disponible' }}
                </dd>
              </div>
            </dl>

            <aside class="conditions" aria-labelledby="conditions-title">
              <h2 id="conditions-title">⚠ Conditions du menu — à lire avant de commander</h2>
              <p>{{ menu.conditions }}</p>
            </aside>

            <button
              type="button"
              class="order-btn"
              :disabled="menu.stock === 0"
              @click="order"
            >
              {{ menu.stock === 0 ? 'Menu épuisé' : 'Commander ce menu' }}
            </button>

            <p v-if="staffMessage" class="login-prompt" role="alert">{{ staffMessage }}</p>

            <div v-if="askLogin" class="login-prompt" role="alert">
              <p>Vous devez être connecté pour commander.</p>
              <router-link :to="{ path: '/login', query: { redirect: orderPath } }">Se connecter</router-link>
              <router-link :to="{ path: '/register', query: { redirect: orderPath } }">Créer un compte</router-link>
            </div>
          </section>
        </div>

        <section class="dishes" aria-labelledby="dishes-title">
          <h2 id="dishes-title">Composition du menu</h2>
          <div class="courses">
            <div v-for="course in courses" :key="course.key" class="course">
              <h3>{{ course.label }}</h3>
              <ul>
                <li v-for="dish in menu.dishes[course.key]" :key="dish.id">
                  <span class="dish-name">{{ dish.name }}</span>
                  <span class="allergens">
                    Allergènes : {{ dish.allergens.length ? dish.allergens.join(', ') : 'aucun' }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </article>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/services/http'
import { imageUrl, euros } from '@/utils/format'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { fetchUser } = useAuth()

const menu = ref(null)
const loading = ref(true)
const error = ref('')
const current = ref(0)
const askLogin = ref(false)

async function load(id) {
  loading.value = true
  error.value = ''
  current.value = 0
  askLogin.value = false
  staffMessage.value = ''
  try {
    menu.value = await api(`/api/menus/${encodeURIComponent(id)}`)
  } catch (err) {
    menu.value = null
    error.value = err.status === 404 ? "Ce menu n'existe pas." : err.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })

const courses = [
  { key: 'starters', label: 'Entrées' },
  { key: 'mains', label: 'Plats' },
  { key: 'desserts', label: 'Desserts' }
]

const orderPath = computed(() => `/order?menu=${menu.value.id}`)
const staffMessage = ref('')

// KAN-46: logged-in customer -> order page with this menu pre-selected;
// visitor -> asked to log in or sign up, then sent back to the order page
async function order() {
  staffMessage.value = ''
  const user = await fetchUser()
  if (!user) {
    askLogin.value = true
  } else if (user.role !== 'user') {
    staffMessage.value = 'Les commandes se passent depuis un compte client.'
  } else {
    router.push(orderPath.value)
  }
}
</script>

<style scoped>
.page-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.menu-detail {
  flex: 1;
  padding: 24px 0 48px;
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: #2e7d32;
  text-decoration: underline;
}

.not-found {
  padding: 32px 0;
}

.menu-detail h1 {
  margin-bottom: 8px;
}

.badges {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.badges li {
  background: #e8f5e9;
  color: #1b5e20;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.9rem;
}

.top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.gallery-main {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}

.thumbs {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.thumb {
  padding: 0;
  background: none;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
}

.thumb.active {
  border-color: #2e7d32;
}

.thumb img {
  display: block;
  width: 72px;
  height: 54px;
  object-fit: cover;
}

.desc {
  color: #444;
  margin-bottom: 16px;
}

.facts {
  margin: 0 0 16px;
}

.facts div {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.facts dt {
  font-weight: 600;
  min-width: 110px;
}

.facts dd {
  margin: 0;
}

.out-of-stock {
  color: #b71c1c;
  font-weight: 600;
}

.conditions {
  background: #fff3e0;
  border: 2px solid #e65100;
  border-left-width: 8px;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 16px 0;
}

.conditions h2 {
  font-size: 1.05rem;
  color: #bf360c;
  margin-bottom: 6px;
}

.conditions p {
  color: #3e2723;
}

.order-btn {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  background: #2e7d32;
}

.order-btn:hover {
  background: #1b5e20;
}

.order-btn:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.login-prompt {
  margin-top: 12px;
  padding: 12px 16px;
  background: #e3f2fd;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.login-prompt p {
  width: 100%;
}

.login-prompt a {
  color: #0d47a1;
  font-weight: 600;
  text-decoration: underline;
}

.dishes {
  margin-top: 40px;
}

.courses {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.course {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.course h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.course ul {
  list-style: none;
  padding: 0;
}

.course li {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.course li:last-child {
  border-bottom: none;
}

.dish-name {
  font-weight: 600;
}

.allergens {
  font-size: 0.85rem;
  color: #555;
}

button:focus-visible,
a:focus-visible {
  outline: 3px solid #1565c0;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .top,
  .courses {
    grid-template-columns: 1fr;
  }
}
</style>
