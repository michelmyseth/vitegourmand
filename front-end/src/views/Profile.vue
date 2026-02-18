<template>
  <div class="profile-container">
    <h1>Page Profil</h1>
    <button v-if="userInfo" @click="logout">Se déconnecter</button>
    <pre v-if="userInfo">{{ userInfo }}</pre>
    <p v-else>{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null,
      errorMessage: "Chargement..."
    };
  },
  async mounted() {
    try {
      const res = await fetch("http://localhost:3000/api/profile", {
        method: "GET",
        credentials: "include"
      });

      if (res.status === 401) {
        this.errorMessage = "Vous n'avez pas accès à cette ressource";
        this.$router.push("/login");
        return;
      }

      this.userInfo = await res.json();
    } catch (err) {
      console.error(err);
      this.errorMessage = "Erreur réseau";
    }
  },
  methods: {
    async logout() {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      this.userInfo = null;
      this.$router.push("/login");
    }
  }
};
</script>


<style scoped>
.profile-container { max-width: 600px; margin: 50px auto; }
pre { background: #f5f5f5; padding: 10px; }
button { padding: 10px 15px; margin: 5px; cursor: pointer; }
</style>
