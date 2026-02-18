<template>
  <header class="navbar">
    <div class="navbar-title">Vite&Goumand</div>
    <nav class="navbar-links">
      <a href="/">Accueil</a>
      <a href="/menus">Menus</a>
      <a href="/contact">Contact</a>
      <a href="/login">Connexion</a>
    </nav>
  </header>
</template>

<style>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.navbar-title {
  font-size: 2rem;
  font-weight: bold;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-links a {
  text-decoration: none;
  color: #222;
  font-weight: 500;
  font-size: 1rem;
}

.navbar-btn {
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: bold;
  margin-left: 16px;
  cursor: pointer;
}
</style>