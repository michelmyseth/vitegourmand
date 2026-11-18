<template>
  <footer class="footer">
    <div class="hours">
      <h2>Horaires</h2>
      <dl>
        <div v-for="h in hours" :key="h.dayOfWeek" class="hours-row">
          <dt>{{ DAY_NAMES[h.dayOfWeek - 1] }}</dt>
          <dd>{{ h.isClosed ? 'Fermé' : `${h.openTime} - ${h.closeTime}` }}</dd>
        </div>
      </dl>
    </div>

    <nav class="links" aria-label="Informations légales">
      <router-link to="/legal">Mentions légales</router-link>
      <router-link to="/terms">Conditions générales de vente</router-link>
    </nav>
  </footer>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOpeningHours, DAY_NAMES } from '@/composables/useOpeningHours'

// Opening hours from the database, edited in the employee area (KAN-59)
const { hours, load } = useOpeningHours()
onMounted(() => load())
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #fff;
  gap: 24px;
}

.hours h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.hours dl {
  margin: 0;
  color: #555;
  font-size: 0.9rem;
}

.hours-row {
  display: flex;
  gap: 8px;
}

.hours-row dt {
  min-width: 80px;
}

.hours-row dd {
  margin: 0;
}

.links {
  display: flex;
  gap: 16px;
}

.links a {
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
}

.links a:hover {
  text-decoration: underline;
}

.links a:focus-visible {
  outline: 3px solid #1565c0;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
