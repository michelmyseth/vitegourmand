<template>
  <footer class="footer">
    <div class="hours">
      <h2>Horaires</h2>
      <dl>
        <div v-for="h in hours" :key="h.day" class="hours-row">
          <dt>{{ h.day }}</dt>
          <dd>{{ h.closed ? 'Fermé' : `${h.open} - ${h.close}` }}</dd>
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
// Mock data — replace by API call later (hours editable by employees)
const hours = [
  { day: 'Lundi', open: '09:00', close: '20:00' },
  { day: 'Mardi', open: '09:00', close: '20:00' },
  { day: 'Mercredi', open: '09:00', close: '20:00' },
  { day: 'Jeudi', open: '09:00', close: '20:00' },
  { day: 'Vendredi', open: '09:00', close: '20:00' },
  { day: 'Samedi', open: '09:00', close: '20:00' },
  { day: 'Dimanche', open: '09:00', close: '20:00' }
]
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
