<script setup lang="ts">
import { defineEmits } from 'vue'
const emit = defineEmits(['navigate'])

function go(page: string) {
  emit('navigate', page)
}
</script>

<template>
  <header class="header">
    <div class="brand" @click="go('home')">ViteGourmand</div>
    <nav>
      <button @click="go('home')">Accueil</button>
      <button @click="go('menus')">Tous les menus</button>
      <button @click="go('contact')">Contact</button>
      <button @click="go('login')">Connexion</button>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:12px 0;
  border-bottom:1px solid #eee;
}
.brand{font-weight:700;cursor:pointer}
nav button{margin-left:8px;padding:6px 10px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer}
</style>
