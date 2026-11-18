<template>
  <span class="status-badge" :class="`status-${status}`">{{ STATUS_LABELS[status] || status }}</span>
</template>

<script setup>
import { STATUS_LABELS } from '@/utils/format'

defineProps({ status: { type: String, required: true } })
</script>

<style scoped>
/* Contrast ratio >= 4.5:1 for every status (RGAA) */
.status-pending { background: #fff3e0; color: #8a3b00; }
.status-accepted { background: #e3f2fd; color: #0d47a1; }
.status-preparing { background: #ede7f6; color: #4527a0; }
.status-delivering { background: #e0f7fa; color: #00535b; }
.status-delivered { background: #e8f5e9; color: #1b5e20; }
.status-awaiting_equipment_return { background: #fff8e1; color: #6d4c00; }
.status-completed { background: #2e7d32; color: #fff; }
.status-cancelled { background: #ffebee; color: #8e0000; }
</style>
