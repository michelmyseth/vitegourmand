<template>
  <div class="page-root">
    <Header />
    <main class="terms container">
      <h1>Conditions générales de vente</h1>

      <section>
        <h2>1. Objet</h2>
        <p>Les présentes conditions régissent les commandes de menus passées auprès de Vite &amp; Gourmand via le site. Toute commande implique l'acceptation sans réserve de ces conditions.</p>
      </section>

      <section>
        <h2>2. Commande</h2>
        <p>La commande nécessite un compte client. Chaque menu impose un nombre minimum de personnes et peut comporter des conditions particulières (délai de commande, précautions de stockage) indiquées sur sa fiche : le client s'engage à en prendre connaissance avant de valider.</p>
        <p>Une réduction de 10 % est appliquée pour toute commande comptant au moins 5 personnes de plus que le minimum indiqué dans le menu.</p>
      </section>

      <section>
        <h2>3. Prix et livraison</h2>
        <p>Les prix sont indiqués en euros TTC. La livraison est offerte dans la ville de Bordeaux. En dehors de Bordeaux, elle est facturée 5 € majorés de 0,59 € par kilomètre parcouru.</p>
      </section>

      <section>
        <h2>4. Modification et annulation</h2>
        <p>Le client peut modifier (hors choix du menu) ou annuler sa commande depuis son espace tant qu'elle n'a pas été acceptée par notre équipe. Au-delà, toute modification doit faire l'objet d'un échange avec Vite &amp; Gourmand.</p>
      </section>

      <section>
        <h2>5. Prêt de matériel</h2>
        <p>Du matériel peut être prêté au client pour la prestation. Il doit être restitué dans un délai de <strong>10 jours ouvrés</strong> à compter de la notification envoyée par email. Passé ce délai, des frais de <strong>600 €</strong> seront facturés au client. Pour restituer le matériel, le client doit prendre contact avec la société.</p>
      </section>

      <section>
        <h2>6. Avis clients</h2>
        <p>Une fois la commande terminée, le client peut laisser un avis (note de 1 à 5 et commentaire). Les avis sont publiés après validation par notre équipe.</p>
      </section>

      <section>
        <h2>7. Données personnelles</h2>
        <p>Le traitement des données personnelles est décrit dans les <router-link to="/legal">mentions légales</router-link>.</p>
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

.terms {
  flex: 1;
  max-width: 900px;
  padding: 32px 0;
}

.terms h2 {
  font-size: 1.3rem;
  margin-top: 24px;
  margin-bottom: 8px;
}

.terms p {
  margin: 8px 0;
  color: #444;
}

.terms a {
  color: #2e7d32;
  text-decoration: underline;
}
</style>
