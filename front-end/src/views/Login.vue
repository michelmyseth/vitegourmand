<template>
  <div class="login-container">
    <h1>Connexion</h1>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Mot de passe" required />
      <button type="submit">Se connecter</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <p class="register-link">
      Nouvelle inscription ? <router-link to="/register">Cliquez ici</router-link>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: ""
    };
  },
  methods: {
    async login() {
      this.errorMessage = "";
      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) {
          this.errorMessage = data.error || "Erreur de connexion";
          return;
        }
        this.$router.push("/profile");
      } catch (err) {
        this.errorMessage = "Erreur réseau";
      }
    }
  }
};
</script>

<style scoped>
.login-container { max-width: 400px; margin: 50px auto; }
input { display: block; width: 100%; margin: 10px 0; padding: 8px; }
button { padding: 10px 15px; cursor: pointer; }
.error { color: red; }
.register-link { margin-top: 15px; }
</style>
