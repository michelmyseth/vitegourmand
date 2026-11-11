<template>
  <div class="contact-page">
    <Header />
    <main>
      <h1>Contactez-nous</h1>
    <form @submit.prevent="sendMessage">
      <div class="form-group">
        <label for="name">Nom :</label>
        <input type="text" id="name" v-model="name" required />
      </div>

      <div class="form-group">
        <label for="email">Email :</label>
        <input type="email" id="email" v-model="email" required />
      </div>

      <div class="form-group">
        <label for="message">Message :</label>
        <textarea id="message" v-model="message" required></textarea>
      </div>

      <button type="submit">Envoyer</button>
    </form>

    <p v-if="success" class="success-message">Message envoyé avec succès !</p>
    </main>
            <Footer />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
const name = ref('')
const email = ref('')
const message = ref('')
const success = ref(false)

const sendMessage = () => {
  console.log('Nom:', name.value)
  console.log('Email:', email.value)
  console.log('Message:', message.value)

  name.value = ''
  email.value = ''
  message.value = ''
  success.value = true

  setTimeout(() => success.value = false, 3000)
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-form {
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

input, textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}

.success-message {
  margin-top: 15px;
  color: green;
  font-weight: bold;
}

</style>