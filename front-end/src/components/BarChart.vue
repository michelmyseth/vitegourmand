<template>
  <div class="chart-box" :style="{ height: `${Math.max(160, labels.length * 44 + 40)}px` }">
    <canvas ref="canvas" role="img" :aria-label="ariaLabel"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

// Horizontal bars, one series (one colour, no legend: the title names it)
const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  ariaLabel: { type: String, required: true },
  format: { type: Function, default: (v) => String(v) },
  integer: { type: Boolean, default: false }
})

const canvas = ref(null)
let chart = null

// The canvas cannot read CSS variables itself: take them from the palette of style.css
function cssColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function render() {
  chart?.destroy()
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.values,
        backgroundColor: cssColor('--color-primary'),
        hoverBackgroundColor: cssColor('--color-primary-dark'),
        borderRadius: 4,
        borderSkipped: 'start',
        maxBarThickness: 24
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => props.format(ctx.parsed.x) } }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: cssColor('--color-line') },
          border: { display: false },
          ticks: { color: cssColor('--color-text-muted'), precision: props.integer ? 0 : undefined, callback: (v) => props.format(v) }
        },
        y: { grid: { display: false }, ticks: { color: cssColor('--color-text') } }
      }
    }
  })
}

onMounted(render)
watch(() => [props.labels, props.values], render)
onBeforeUnmount(() => chart?.destroy())
</script>

<style scoped>
.chart-box {
  position: relative;
  width: 100%;
}
</style>
