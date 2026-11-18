import { ref } from 'vue'
import { api } from '@/services/http'

export const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Shared: the footer is refreshed as soon as an employee saves new hours
const hours = ref([])
let loaded = null

export function useOpeningHours() {
  function load(force = false) {
    if (!loaded || force) {
      loaded = api('/api/opening-hours')
        .then((h) => {
          hours.value = h
        })
        .catch(() => {
          loaded = null
        })
    }
    return loaded
  }

  function set(h) {
    hours.value = h
  }

  return { hours, load, set }
}
