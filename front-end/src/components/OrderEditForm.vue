<template>
  <form class="edit-form" novalidate @submit.prevent="save">
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <!-- Employees must say how they reached the customer and why (KAN-62) -->
    <template v-if="withContact">
      <fieldset class="field">
        <legend class="label">Client contacté par</legend>
        <label class="inline"><input v-model="form.contactMethod" type="radio" value="phone" /> Téléphone</label>
        <label class="inline"><input v-model="form.contactMethod" type="radio" value="email" /> Email</label>
        <p v-if="errors.contactMethod" class="err">{{ errors.contactMethod }}</p>
      </fieldset>
      <div class="field">
        <label :for="`${uid}-reason`">Motif de la modification</label>
        <textarea :id="`${uid}-reason`" v-model.trim="form.reason" rows="2" maxlength="500" :aria-invalid="!!errors.reason"></textarea>
        <p v-if="errors.reason" class="err">{{ errors.reason }}</p>
      </div>
    </template>

    <div class="field">
      <label :for="`${uid}-people`">Nombre de personnes (minimum {{ order.menuMinPeople }})</label>
      <input :id="`${uid}-people`" v-model.number="form.people" type="number" :min="order.menuMinPeople" step="1" :aria-invalid="!!errors.people" />
      <p v-if="errors.people" class="err">{{ errors.people }}</p>
    </div>

    <AddressAutocomplete :id="`${uid}-address`" v-model="form.place_" :error="errors.address" />

    <div class="grid-2">
      <div class="field">
        <label :for="`${uid}-date`">Date</label>
        <input :id="`${uid}-date`" v-model="form.date" type="date" :aria-invalid="!!errors.date" />
        <p v-if="errors.date" class="err">{{ errors.date }}</p>
      </div>
      <div class="field">
        <label :for="`${uid}-time`">Heure</label>
        <input :id="`${uid}-time`" v-model="form.time" type="time" :aria-invalid="!!errors.time" />
        <p v-if="errors.time" class="err">{{ errors.time }}</p>
      </div>
    </div>

    <div class="field">
      <label :for="`${uid}-place`">Précisions sur le lieu</label>
      <textarea :id="`${uid}-place`" v-model.trim="form.place" rows="2" maxlength="300"></textarea>
    </div>

    <p class="help">Le menu ne peut pas être changé. Le prix et la livraison sont recalculés.</p>

    <div class="actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Annuler</button>
      <button type="submit" class="btn" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, useId } from 'vue'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import { api } from '@/services/http'
import { focusFirstError } from '@/utils/validation'

const props = defineProps({
  order: { type: Object, required: true },
  endpoint: { type: String, required: true }, // PUT url
  withContact: { type: Boolean, default: false }
})
const emit = defineEmits(['saved', 'cancel'])

const uid = useId()
const form = reactive({
  people: props.order.people,
  place_: { address: props.order.address, postcode: props.order.postcode, city: props.order.city },
  date: props.order.date,
  time: props.order.time,
  place: props.order.place,
  contactMethod: '',
  reason: ''
})
const errors = reactive({})
const error = ref('')
const saving = ref(false)

async function save() {
  error.value = ''
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!Number.isInteger(form.people) || form.people < props.order.menuMinPeople) {
    errors.people = `Au moins ${props.order.menuMinPeople} personnes.`
  }
  if (!form.place_) errors.address = 'Choisissez une adresse dans la liste.'
  if (!form.date) errors.date = 'La date est obligatoire.'
  if (!form.time) errors.time = "L'heure est obligatoire."
  if (props.withContact) {
    if (!form.contactMethod) errors.contactMethod = 'Indiquez comment le client a été contacté.'
    if (!form.reason) errors.reason = 'Le motif est obligatoire.'
  }
  if (Object.keys(errors).length) return focusFirstError()

  saving.value = true
  try {
    const order = await api(props.endpoint, {
      method: 'PUT',
      body: {
        people: form.people,
        ...form.place_,
        date: form.date,
        time: form.time,
        place: form.place,
        ...(props.withContact ? { contactMethod: form.contactMethod, reason: form.reason } : {})
      }
    })
    emit('saved', order)
  } catch (err) {
    error.value = err.message
    Object.assign(errors, err.details)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
fieldset.field {
  border: none;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
