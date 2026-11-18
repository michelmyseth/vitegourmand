<template>
  <div class="field address">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="text"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="suggestions.length > 0"
      :aria-controls="`${id}-list`"
      :aria-invalid="!!error"
      :aria-describedby="`${id}-help ${id}-err`"
      @input="onInput"
    />
    <ul v-if="suggestions.length" :id="`${id}-list`" role="listbox" class="suggestions">
      <li v-for="s in suggestions" :key="s.label" role="option" :aria-selected="false">
        <button type="button" @click="pick(s)">{{ s.label }}</button>
      </li>
    </ul>
    <p :id="`${id}-help`" class="help">Choisissez une adresse dans la liste proposée.</p>
    <p v-if="error" :id="`${id}-err`" class="err">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { searchAddress } from '@/services/geo'

const props = defineProps({
  // { address, postcode, city } or null
  modelValue: { type: Object, default: null },
  label: { type: String, default: "Adresse de l'événement" },
  id: { type: String, default: 'address' },
  error: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const toText = (a) => (a ? `${a.address} ${a.postcode} ${a.city}` : '')
const text = ref(toText(props.modelValue))
const suggestions = ref([])
let debounce

function onInput() {
  emit('update:modelValue', null) // typing invalidates the chosen address
  clearTimeout(debounce)
  debounce = setTimeout(async () => {
    suggestions.value = await searchAddress(text.value).catch(() => [])
  }, 300)
}

function pick(s) {
  const value = { address: s.street, postcode: s.postcode, city: s.city }
  text.value = s.label
  suggestions.value = []
  emit('update:modelValue', value)
}
</script>

<style scoped>
.suggestions {
  list-style: none;
  border: 1px solid #757575;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background: #fff;
}

.suggestions button {
  width: 100%;
  text-align: left;
  background: none;
  color: #333;
  border-radius: 0;
  padding: 8px 10px;
}

.suggestions button:hover,
.suggestions button:focus-visible {
  background: #e8f5e9;
}
</style>
