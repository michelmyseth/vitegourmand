<template>
  <section aria-labelledby="dishes-title">
    <div class="head">
      <h2 id="dishes-title">Plats et allergènes</h2>
      <button v-if="!editing" type="button" class="btn" @click="startEdit(null)">+ Nouveau plat</button>
    </div>

    <p v-if="message" class="alert alert-success" role="status">{{ message }}</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <form v-if="editing" ref="formEl" class="panel" novalidate @submit.prevent="save">
      <h3>{{ form.id ? 'Modifier le plat' : 'Nouveau plat' }}</h3>
      <div class="grid-2">
        <div class="field">
          <label for="d-name">Nom</label>
          <input id="d-name" v-model.trim="form.name" maxlength="150" :aria-invalid="!!errors.name" />
          <p v-if="errors.name" class="err">{{ errors.name }}</p>
        </div>
        <div class="field">
          <label for="d-course">Type</label>
          <select id="d-course" v-model="form.course" :aria-invalid="!!errors.course">
            <option value="" disabled>Choisir</option>
            <option v-for="(label, key) in COURSES" :key="key" :value="key">{{ label }}</option>
          </select>
          <p v-if="errors.course" class="err">{{ errors.course }}</p>
        </div>
      </div>
      <div class="field">
        <label for="d-desc">Description <span class="help">(facultatif)</span></label>
        <textarea id="d-desc" v-model.trim="form.description" rows="2" maxlength="1000"></textarea>
      </div>
      <fieldset class="field allergens">
        <legend class="label">Allergènes</legend>
        <label v-for="a in allergens" :key="a.id" class="inline">
          <input v-model="form.allergenIds" type="checkbox" :value="a.id" /> {{ a.label }}
        </label>
      </fieldset>
      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="editing = false">Annuler</button>
        <button type="submit" class="btn" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
      </div>
    </form>

    <p v-if="loading" aria-busy="true">Chargement…</p>
    <div v-else-if="!editing" class="table-wrap">
      <table class="data-table">
        <caption class="sr-only">Liste des plats</caption>
        <thead>
          <tr>
            <th scope="col">Plat</th>
            <th scope="col">Type</th>
            <th scope="col">Allergènes</th>
            <th scope="col">Menus</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in dishes" :key="d.id">
            <td>{{ d.name }}</td>
            <td>{{ COURSES[d.course] }}</td>
            <td>{{ d.allergens.join(', ') || 'Aucun' }}</td>
            <td>{{ d.menuCount }}</td>
            <td class="row-actions">
              <button type="button" class="btn btn-small" @click="startEdit(d)">
                Modifier<span class="sr-only"> {{ d.name }}</span>
              </button>
              <button type="button" class="btn btn-danger btn-small" @click="remove(d)">
                Supprimer<span class="sr-only"> {{ d.name }}</span>
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
import { focusFirstError } from '@/utils/validation'

const COURSES = { starter: 'Entrée', main: 'Plat', dessert: 'Dessert' }

const dishes = ref([])
const allergens = ref([])
const loading = ref(true)
const error = ref('')
const message = ref('')
const editing = ref(false)
const saving = ref(false)
const form = reactive({ id: null, name: '', course: '', description: '', allergenIds: [] })
const errors = reactive({})
const formEl = ref(null)

async function load() {
  try {
    dishes.value = await api('/api/staff/dishes')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  load()
  allergens.value = await api('/api/allergens').catch(() => [])
})

async function startEdit(d) {
  Object.keys(errors).forEach((k) => delete errors[k])
  error.value = ''
  message.value = ''
  Object.assign(form, d
    ? { id: d.id, name: d.name, course: d.course, description: d.description, allergenIds: [...d.allergenIds] }
    : { id: null, name: '', course: '', description: '', allergenIds: [] })
  editing.value = true
  await nextTick()
  formEl.value?.querySelector('input')?.focus()
}

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k])
  error.value = ''
  saving.value = true
  try {
    const { id, ...body } = form
    await api(id ? `/api/staff/dishes/${id}` : '/api/staff/dishes', { method: id ? 'PUT' : 'POST', body })
    message.value = 'Plat enregistré.'
    editing.value = false
    await load()
  } catch (err) {
    error.value = err.message
    Object.assign(errors, err.details)
    focusFirstError()
  } finally {
    saving.value = false
  }
}

async function remove(d) {
  if (!window.confirm(`Supprimer le plat « ${d.name} » ?`)) return
  error.value = ''
  message.value = ''
  try {
    await api(`/api/staff/dishes/${d.id}`, { method: 'DELETE' })
    message.value = 'Plat supprimé.'
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

.allergens {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 4px 12px;
}

.allergens legend {
  padding: 0 4px;
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
</style>
