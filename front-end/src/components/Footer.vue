<script setup lang="ts">
const emit = defineEmits(['navigate'])

function go(page: string) { emit('navigate', page) }
</script>

<template>
  <footer class="footer">
    <div class="hours">
      <strong>Horaires</strong>
      <div>Lu - Di : 09:00 - 20:00</div>
    </div>

    <div class="links">
      <button @click="go('legal')">Mentions légales</button>
      <button @click="go('terms')">Conditions générales de vente</button>
    </div>
  </footer>
</template>

<style scoped>
.footer{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid #eee}
.footer .links button{margin-left:8px;padding:6px;border-radius:6px;border:1px solid #ddd;background:#fff}
</style>
