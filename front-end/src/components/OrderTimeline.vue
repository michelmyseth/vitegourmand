<template>
  <ol class="timeline" aria-label="Historique des statuts">
    <li v-for="(h, i) in history" :key="i" :class="{ current: i === history.length - 1 }">
      <span class="dot" aria-hidden="true"></span>
      <div>
        <StatusBadge :status="h.status" />
        <time :datetime="h.changedAt">{{ formatDateTime(h.changedAt) }}</time>
        <p v-if="h.reason" class="reason">{{ h.reason }}</p>
        <p v-if="staff && (h.changedBy || h.contactMethod)" class="meta">
          <template v-if="h.changedBy">Par {{ h.changedBy }}</template>
          <template v-if="h.contactMethod"> — client contacté par {{ h.contactMethod === 'phone' ? 'téléphone' : 'email' }}</template>
        </p>
      </div>
    </li>
  </ol>
</template>

<script setup>
import StatusBadge from '@/components/StatusBadge.vue'
import { formatDateTime } from '@/utils/format'

defineProps({
  history: { type: Array, required: true },
  staff: { type: Boolean, default: false } // employees also see who did it and how the customer was contacted
})
</script>

<style scoped>
.timeline {
  list-style: none;
  border-left: 3px solid #c8e6c9;
  margin-left: 8px;
}

.timeline li {
  position: relative;
  padding: 0 0 16px 20px;
}

.dot {
  position: absolute;
  left: -9px;
  top: 4px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #81c784;
}

.current .dot {
  background: #2e7d32;
  border-color: #2e7d32;
}

time {
  display: block;
  font-size: 0.9rem;
  color: #555;
  margin-top: 2px;
}

.reason,
.meta {
  font-size: 0.9rem;
  margin-top: 4px;
}

.meta {
  color: #555;
}
</style>
