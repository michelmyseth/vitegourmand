<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      :value="modelValue"
      type="password"
      autocomplete="new-password"
      :aria-invalid="!!error"
      :aria-describedby="`${id}-rules ${id}-err`"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <ul :id="`${id}-rules`" class="rules" aria-label="Règles du mot de passe">
      <li v-for="rule in PASSWORD_RULES" :key="rule.label" :class="{ ok: rule.test(modelValue) }">
        <span aria-hidden="true">{{ rule.test(modelValue) ? '✔' : '•' }}</span>
        {{ rule.label }}<span class="sr-only">{{ rule.test(modelValue) ? ' : respecté' : ' : non respecté' }}</span>
      </li>
    </ul>
    <p v-if="error" :id="`${id}-err`" class="err">{{ error }}</p>
  </div>
</template>

<script setup>
import { PASSWORD_RULES } from '@/utils/validation'

defineProps({
  modelValue: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: 'password' },
  label: { type: String, default: 'Mot de passe' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.rules {
  list-style: none;
  margin-top: 6px;
  font-size: 0.9rem;
  color: #555;
  display: flex;
  flex-wrap: wrap;
  gap: 2px 16px;
}

.rules .ok {
  color: #1b5e20;
}
</style>
