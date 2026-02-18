<template>
  <footer class="footer">
    <div class="hours">
      <strong>Horaires</strong>
      <div>Lu - Di : 09:00 - 20:00</div>
    </div>

    <div class="links">
      <a href="/legal">Mentions légales</a>
      <a href="/terms">Conditions générales de vente</a>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Navigation handled by router
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #fff;
  gap: 24px;
}

.footer .hours {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #555;
}

.footer .hours strong {
  font-weight: 600;
  color: #333;
}

.footer .links {
  display: flex;
  gap: 16px;
}

.footer .links a {
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>