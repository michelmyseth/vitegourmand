<template>
  <form novalidate @submit.prevent="send">
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <fieldset class="stars">
      <legend class="label">Votre note</legend>
      <template v-for="n in 5" :key="n">
        <input :id="`star-${n}`" v-model="rating" type="radio" name="rating" :value="n" class="sr-only" />
        <label :for="`star-${n}`" :class="{ on: n <= rating }">
          <span aria-hidden="true">★</span><span class="sr-only">{{ n }} sur 5</span>
        </label>
      </template>
      <p v-if="errors.rating" class="err">{{ errors.rating }}</p>
    </fieldset>

    <div class="field">
      <label for="review-comment">Votre commentaire</label>
      <textarea id="review-comment" v-model.trim="comment" rows="4" maxlength="1000" :aria-invalid="!!errors.comment" aria-describedby="review-help"></textarea>
      <p id="review-help" class="help">{{ comment.length }} / 1000 caractères. Votre avis sera publié après validation par notre équipe.</p>
      <p v-if="errors.comment" class="err">{{ errors.comment }}</p>
    </div>

    <button type="submit" class="btn" :disabled="sending">{{ sending ? 'Envoi…' : 'Envoyer mon avis' }}</button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from '@/services/http'

const props = defineProps({ orderId: { type: Number, required: true } })
const emit = defineEmits(['sent'])

const rating = ref(0)
const comment = ref('')
const errors = reactive({})
const error = ref('')
const sending = ref(false)

async function send() {
  error.value = ''
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!rating.value) errors.rating = 'Choisissez une note de 1 à 5.'
  if (!comment.value) errors.comment = 'Le commentaire est obligatoire.'
  if (Object.keys(errors).length) return

  sending.value = true
  try {
    const review = await api(`/api/orders/${props.orderId}/review`, {
      method: 'POST',
      body: { rating: rating.value, comment: comment.value }
    })
    emit('sent', review)
  } catch (err) {
    error.value = err.message
    Object.assign(errors, err.details)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.stars {
  border: none;
  margin-bottom: 14px;
}

.stars label {
  font-size: 2rem;
  color: #9e9e9e;
  cursor: pointer;
  padding: 0 2px;
}

.stars label.on {
  color: #b26a00;
}

.stars input:focus-visible + label {
  outline: 3px solid #1565c0;
  outline-offset: 2px;
}
</style>
