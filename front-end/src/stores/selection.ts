import { ref } from 'vue'

export type MenuSelection = {
  menuId: number | null
}

export const selectedMenuId = ref<number | null>(null)
