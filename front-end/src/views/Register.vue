<template>
  <div class="register-container">
    <h1>Inscription</h1>
    <form @submit.prevent="register">
      <input type="text" v-model="username" placeholder="Nom d'utilisateur" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Mot de passe" required />
      <button type="submit">S'inscrire</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>

    <p class="login-link">
      Déjà inscrit ? <router-link to="/login">Connectez-vous</router-link>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      errorMessage: "",
      successMessage: ""
    };
  },
  methods: {
 async register() {
  this.errorMessage = "";
  this.successMessage = "";
  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: this.username,
        email: this.email,
        password: this.password
      }),
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) {
      this.errorMessage = data.error || "Erreur lors de l'inscription";
      return;
    }

    this.successMessage = "Inscription réussie ! Vous allez être redirigé vers la page de connexion...";

    setTimeout(() => {
      this.$router.push("/login");
    }, 3000);

  } catch (err) {
    this.errorMessage = "Erreur réseau";
  }
}
    }
};
</script>

<style scoped>
.register-container { max-width: 400px; margin: 50px auto; }
input { display: block; width: 100%; margin: 10px 0; padding: 8px; }
button { padding: 10px 15px; cursor: pointer; }
.error { color: red; }
.success { color: green; }
.login-link { margin-top: 15px; }
</style>
