<template>
  <section aria-labelledby="reviews-title">
    <h2 id="reviews-title">Avis clients</h2>
    <p class="help">Seuls les avis validés sont affichés sur la page d'accueil.</p>

    <div class="field filter">
      <label for="r-status">Afficher</label>
      <select id="r-status" v-model="status" @change="load">
        <option value="pending">À modérer</option>
        <option value="approved">Validés</option>
        <option value="rejected">Refusés</option>
        <option value="">Tous</option>
      </select>
    </div>

    <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <p v-if="loading" aria-busy="true">Chargement…</p>
    <p v-else-if="!reviews.length" class="panel">Aucun avis.</p>

    <ul v-else class="reviews">
      <li v-for="r in reviews" :key="r.id" class="panel">
        <div class="top">
          <p class="stars" :aria-label="`${r.rating} sur 5`"><span aria-hidden="true">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span></p>
          <span class="status-badge">{{ LABELS[r.status] }}</span>
        </div>
        <blockquote>{{ r.comment }}</blockquote>
        <p class="help">
          {{ r.author }} — {{ r.menuTitle }} (commande {{ r.orderNumber }}) — {{ formatDateTime(r.createdAt) }}
          <template v-if="r.moderatedBy"><br />Modéré par {{ r.moderatedBy }} le {{ formatDateTime(r.moderatedAt) }}</template>
        </p>
        <div class="buttons">
          <button v-if="r.status !== 'approved'" type="button" class="btn btn-small" @click="moderate(r, 'approved')">
            Valider<span class="sr-only"> l'avis de {{ r.author }}</span>
          </button>
          <button v-if="r.status !== 'rejected'" type="button" class="btn btn-danger btn-small" @click="moderate(r, 'rejected')">
            Refuser<span class="sr-only"> l'avis de {{ r.author }}</span>
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/http'
import { formatDateTime } from '@/utils/format'

const LABELS = { pending: 'À modérer', approved: 'Validé', rejected: 'Refusé' }

const status = ref('pending')
const reviews = ref([])
const loading = ref(true)
const error = ref('')
const message = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    reviews.value = await api('/api/staff/reviews', { query: { status: status.value } })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function moderate(r, newStatus) {
  error.value = ''
  message.value = ''
  try {
    await api(`/api/staff/reviews/${r.id}`, { method: 'PUT', body: { status: newStatus } })
    message.value = newStatus === 'approved' ? 'Avis validé : il est affiché sur la page d’accueil.' : 'Avis refusé.'
    await load()
  } catch (err) {
    error.value = err.message
  }
}

onMounted(load)
</script>

<style scoped>
.filter {
  max-width: 240px;
  margin-top: 12px;
}

.reviews {
  list-style: none;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stars {
  color: #b26a00;
  font-size: 1.3rem;
}

blockquote {
  margin: 8px 0;
  font-style: italic;
}

.buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
