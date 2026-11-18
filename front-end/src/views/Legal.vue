<template>
  <div class="page-root">
    <Header />
    <main class="legal container">
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          Vite &amp; Gourmand — traiteur<br />
          Siège social : [adresse], 33000 Bordeaux<br />
          SIRET : [numéro SIRET]<br />
          Téléphone : [numéro] — Email : [adresse email]<br />
          Responsables de la publication : Julie et José
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>[Nom de l'hébergeur], [adresse de l'hébergeur], [site web de l'hébergeur].</p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus de ce site (textes, images, logos) est la propriété de Vite &amp; Gourmand. Toute
          reproduction sans autorisation est interdite.
        </p>
      </section>

      <section>
        <h2>Données personnelles (RGPD)</h2>
        <p>
          Les données collectées (nom, prénom, email, téléphone, adresse) sont utilisées uniquement pour la gestion de
          votre compte et de vos commandes. Elles ne sont jamais cédées à des tiers.
        </p>
        <p>
          Conformément au Règlement Général sur la Protection des Données, vous disposez d'un droit d'accès, de
          rectification, d'opposition et de suppression de vos données. Pour l'exercer, contactez-nous via la
          <router-link to="/contact">page contact</router-link>.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Ce site utilise uniquement un cookie technique nécessaire à la connexion à votre compte. Aucun cookie
          publicitaire ou de mesure d'audience n'est déposé.
        </p>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.page-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.legal {
  flex: 1;
  max-width: 900px;
  padding: 32px 0;
}

.legal h2 {
  font-size: 1.3rem;
  margin-top: 24px;
  margin-bottom: 8px;
}

.legal p {
  margin: 8px 0;
  color: #444;
}

.legal a {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
