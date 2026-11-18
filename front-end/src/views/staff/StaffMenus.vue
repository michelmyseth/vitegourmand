<template>
  <section aria-labelledby="menus-title">
    <div class="head">
      <h2 id="menus-title">Menus</h2>
      <button v-if="!editing" type="button" class="btn" @click="startCreate">+ Nouveau menu</button>
    </div>

    <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <!-- Create / edit form -->
    <form v-if="editing" ref="formEl" class="panel" novalidate @submit.prevent="save">
      <h3>{{ form.id ? `Modifier « ${original.title} »` : 'Nouveau menu' }}</h3>

      <div class="grid-2">
        <div class="field">
          <label for="m-title">Titre</label>
          <input id="m-title" v-model.trim="form.title" maxlength="100" :aria-invalid="!!errors.title" />
          <p v-if="errors.title" class="err">{{ errors.title }}</p>
        </div>
        <div class="field">
          <label for="m-price">Prix (€) pour le nombre minimum de personnes</label>
          <input
            id="m-price"
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            :aria-invalid="!!errors.price"
          />
          <p v-if="errors.price" class="err">{{ errors.price }}</p>
        </div>
      </div>

      <div class="field">
        <label for="m-desc">Description</label>
        <textarea id="m-desc" v-model.trim="form.description" rows="3" :aria-invalid="!!errors.description"></textarea>
        <p v-if="errors.description" class="err">{{ errors.description }}</p>
      </div>

      <div class="grid-4">
        <div class="field">
          <label for="m-theme">Thème</label>
          <select id="m-theme" v-model.number="form.themeId" :aria-invalid="!!errors.themeId">
            <option :value="null" disabled>Choisir</option>
            <option v-for="t in themes" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
          <p v-if="errors.themeId" class="err">{{ errors.themeId }}</p>
        </div>
        <div class="field">
          <label for="m-diet">Régime</label>
          <select id="m-diet" v-model.number="form.dietId" :aria-invalid="!!errors.dietId">
            <option :value="null" disabled>Choisir</option>
            <option v-for="d in diets" :key="d.id" :value="d.id">{{ d.label }}</option>
          </select>
          <p v-if="errors.dietId" class="err">{{ errors.dietId }}</p>
        </div>
        <div class="field">
          <label for="m-min">Personnes minimum</label>
          <input id="m-min" v-model.number="form.minPeople" type="number" min="1" :aria-invalid="!!errors.minPeople" />
          <p v-if="errors.minPeople" class="err">{{ errors.minPeople }}</p>
        </div>
        <div class="field">
          <label for="m-stock">Stock (commandes possibles)</label>
          <input id="m-stock" v-model.number="form.stock" type="number" min="0" :aria-invalid="!!errors.stock" />
          <p v-if="errors.stock" class="err">{{ errors.stock }}</p>
        </div>
      </div>

      <div class="field">
        <label for="m-cond">Conditions (délai de commande, conservation…)</label>
        <textarea id="m-cond" v-model.trim="form.conditions" rows="2"></textarea>
      </div>

      <fieldset class="field dishes">
        <legend class="label">Plats du menu</legend>
        <div v-for="c in COURSES" :key="c.key" class="course">
          <p class="course-title">{{ c.label }}</p>
          <label v-for="d in dishes.filter((x) => x.course === c.key)" :key="d.id" class="inline">
            <input v-model="form.dishIds" type="checkbox" :value="d.id" />
            {{ d.name }}
          </label>
        </div>
        <p v-if="errors.dishIds" class="err">{{ errors.dishIds }}</p>
      </fieldset>

      <div class="field">
        <label class="inline"><input v-model="form.isActive" type="checkbox" /> Menu visible sur le site</label>
      </div>

      <!-- Images: only once the menu exists -->
      <fieldset v-if="form.id" class="field">
        <legend class="label">Galerie d'images</legend>
        <ul class="images">
          <li v-for="img in images" :key="img.id">
            <img :src="imageUrl(img.url)" :alt="img.alt" />
            <button type="button" class="btn btn-danger btn-small" @click="removeImage(img)">
              Supprimer<span class="sr-only"> l'image {{ img.position }}</span>
            </button>
          </li>
        </ul>
        <label for="m-image">Ajouter une image (JPEG, PNG ou WebP, 2 Mo max.)</label>
        <input
          id="m-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          :disabled="uploading"
          @change="upload"
        />
        <p v-if="uploading" class="help">Envoi…</p>
      </fieldset>
      <p v-else class="help">Les images pourront être ajoutées après l'enregistrement du menu.</p>

      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="editing = false">Annuler</button>
        <button type="submit" class="btn" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
      </div>
    </form>

    <!-- List -->
    <div v-else class="table-wrap">
      <p v-if="loading" aria-busy="true">Chargement…</p>
      <table v-else class="data-table">
        <caption class="sr-only">
          Liste des menus
        </caption>
        <thead>
          <tr>
            <th scope="col">Titre</th>
            <th scope="col">Thème / régime</th>
            <th scope="col">Prix</th>
            <th scope="col">Min.</th>
            <th scope="col">Stock</th>
            <th scope="col">Visible</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in menus" :key="m.id">
            <td>{{ m.title }}</td>
            <td>{{ m.theme }} / {{ m.diet }}</td>
            <td>{{ euros(m.price) }}</td>
            <td>{{ m.minPeople }}</td>
            <td>{{ m.stock }}</td>
            <td>{{ m.isActive ? 'Oui' : 'Non' }}</td>
            <td class="row-actions">
              <button type="button" class="btn btn-small" @click="startEdit(m.id)">
                Modifier<span class="sr-only"> {{ m.title }}</span>
              </button>
              <button type="button" class="btn btn-danger btn-small" @click="remove(m)">
                Supprimer<span class="sr-only"> {{ m.title }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { api } from '@/services/http'
import { euros, imageUrl } from '@/utils/format'
import { focusFirstError } from '@/utils/validation'

const COURSES = [
  { key: 'starter', label: 'Entrées' },
  { key: 'main', label: 'Plats' },
  { key: 'dessert', label: 'Desserts' }
]
const EMPTY = {
  id: null,
  title: '',
  description: '',
  themeId: null,
  dietId: null,
  minPeople: 2,
  price: null,
  conditions: '',
  stock: 10,
  isActive: true,
  dishIds: []
}

const menus = ref([])
const dishes = ref([])
const themes = ref([])
const diets = ref([])
const loading = ref(true)
const error = ref('')
const message = ref('')

const editing = ref(false)
const form = reactive({ ...EMPTY })
const original = ref({})
const images = ref([])
const errors = reactive({})
const saving = ref(false)
const uploading = ref(false)
const formEl = ref(null)

async function load() {
  loading.value = true
  try {
    menus.value = await api('/api/staff/menus')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  load()
  try {
    ;[dishes.value, themes.value, diets.value] = await Promise.all([
      api('/api/staff/dishes'),
      api('/api/themes'),
      api('/api/diets')
    ])
  } catch (err) {
    error.value = err.message
  }
})

async function openForm() {
  Object.keys(errors).forEach((k) => delete errors[k])
  error.value = ''
  message.value = ''
  editing.value = true
  await nextTick()
  formEl.value?.querySelector('input')?.focus()
}

function startCreate() {
  Object.assign(form, { ...EMPTY, dishIds: [] })
  images.value = []
  openForm()
}

async function startEdit(id) {
  try {
    const m = await api(`/api/staff/menus/${id}`)
    original.value = m
    images.value = m.images
    Object.assign(form, {
      id: m.id,
      title: m.title,
      description: m.description,
      themeId: m.themeId,
      dietId: m.dietId,
      minPeople: m.minPeople,
      price: m.price,
      conditions: m.conditions,
      stock: m.stock,
      isActive: m.isActive,
      dishIds: [...m.dishes.starters, ...m.dishes.mains, ...m.dishes.desserts].map((d) => d.id)
    })
    openForm()
  } catch (err) {
    error.value = err.message
  }
}

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k])
  error.value = ''
  saving.value = true
  try {
    const { id, ...body } = form
    const saved = await api(id ? `/api/staff/menus/${id}` : '/api/staff/menus', { method: id ? 'PUT' : 'POST', body })
    message.value = id ? 'Menu enregistré.' : 'Menu créé. Vous pouvez maintenant ajouter des images.'
    await load()
    if (id) {
      editing.value = false
    } else {
      // Stay on the form to add the images
      form.id = saved.id
      original.value = saved
      images.value = saved.images
    }
  } catch (err) {
    error.value = err.message
    Object.assign(errors, err.details)
    focusFirstError()
  } finally {
    saving.value = false
  }
}

async function upload(event) {
  const file = event.target.files[0]
  if (!file) return
  error.value = ''
  uploading.value = true
  try {
    const data = new FormData()
    data.append('image', file)
    images.value.push(await api(`/api/staff/menus/${form.id}/images`, { method: 'POST', body: data }))
  } catch (err) {
    error.value = err.message
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

async function removeImage(img) {
  if (!window.confirm('Supprimer cette image ?')) return
  try {
    await api(`/api/staff/menus/${form.id}/images/${img.id}`, { method: 'DELETE' })
    images.value = images.value.filter((i) => i.id !== img.id)
  } catch (err) {
    error.value = err.message
  }
}

async function remove(m) {
  if (!window.confirm(`Supprimer le menu « ${m.title} » ?`)) return
  error.value = ''
  message.value = ''
  try {
    const res = await api(`/api/staff/menus/${m.id}`, { method: 'DELETE' })
    message.value = res.deleted
      ? 'Menu supprimé.'
      : 'Ce menu a déjà été commandé : il a été masqué du site au lieu d’être supprimé.'
    await load()
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0 16px;
}

fieldset.field {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 14px;
}

.dishes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.dishes legend {
  padding: 0 4px;
}

.course-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.images {
  list-style: none;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.images li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.images img {
  width: 140px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.actions,
.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.actions {
  justify-content: flex-end;
}

@media (max-width: 860px) {
  .grid-4,
  .dishes {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .grid-4,
  .dishes {
    grid-template-columns: 1fr;
  }
}
</style>
