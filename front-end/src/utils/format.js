import { API_URL } from '@/api'

/** Images uploaded by employees are served by the API (/uploads/...), the others by the front-end */
export function imageUrl(url) {
  if (!url) return '/img/menus/couscous.jpg'
  return url.startsWith('/uploads/') ? `${API_URL}${url}` : url
}

export const euros = (n) => Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export function formatDate(value) {
  if (!value) return ''
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export const STATUS_LABELS = {
  pending: 'En attente',
  accepted: 'Acceptée',
  preparing: 'En préparation',
  delivering: 'En cours de livraison',
  delivered: 'Livrée',
  awaiting_equipment_return: 'En attente du retour de matériel',
  completed: 'Terminée',
  cancelled: 'Annulée'
}
