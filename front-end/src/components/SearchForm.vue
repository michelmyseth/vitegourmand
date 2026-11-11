<template>
<form class="search-form" @submit.prevent="onSearch">
<div class="search-row">
<div class="input-group">
<input v-model="filters.from" placeholder="Départ (ville ou adresse)" />
</div>
<div class="input-group">
<input v-model="filters.to" placeholder="Arrivée (ville ou adresse)" />
</div>
<div class="input-group small">
<input type="date" v-model="filters.date" />
</div>
<button class="btn-primary" type="submit">Rechercher</button>
</div>
</form>
</template>

<style>
.search-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.input-group input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 180px;
}

.input-group.small input {
  min-width: 120px;
}

.btn-primary {
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #388e3c;
}

.form-container {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>

<script setup>
import { defineEmits, defineProps } from 'vue'


const props = defineProps({ filters: Object })
const emit = defineEmits(["search"])


function onSearch() {
emit("search")
}
</script>