# Vite & Gourmand

Application web du traiteur bordelais **Vite & Gourmand** : consultation des menus, commande en ligne,
espaces utilisateur, employé et administrateur.

| Partie | Technologies | Dossier |
|---|---|---|
| Front-end | Vue 3, Vue Router, Vite | `front-end/` |
| Back-end (API) | Node.js, Express | `back-end/` |
| Base relationnelle | PostgreSQL 16 | `back-end/database/` |
| Base non relationnelle | MongoDB 7 (statistiques) | — |

Modèle de données : [`docs/data-model.md`](docs/data-model.md)

---

## 🐳 Lancer le projet avec Docker (recommandé)

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS) ou Docker Engine + le plugin Compose (Linux)
- Les ports **8080**, **3000**, **5432** et **27017** libres

Node.js n'a pas besoin d'être installé sur la machine : tout tourne dans les conteneurs.

### Démarrer

```bash
git clone git@github.com:michelmyseth/vitegourmand.git
cd vitegourmand
cp .env.example .env      # facultatif : des valeurs par défaut sont utilisées sinon
docker compose up -d
```

Le premier démarrage prend quelques minutes (téléchargement des images et `npm ci`).

| Service | Adresse | Conteneur |
|---|---|---|
| Site (front-end) | http://localhost:8080 | `vitegourmand-front` |
| API (back-end) | http://localhost:3000 | `vitegourmand-back` |
| PostgreSQL | `localhost:5432` (utilisateur / mot de passe / base : `vitegourmand`) | `vitegourmand-postgres` |
| MongoDB | `mongodb://localhost:27017/vitegourmand` | `vitegourmand-mongo` |

Au **premier** démarrage, PostgreSQL exécute automatiquement `back-end/database/schema.sql`
(création des tables) puis `seed.sql` (données de démonstration).

Le code est monté dans les conteneurs : une modification dans `front-end/` ou `back-end/` est prise
en compte tout de suite (rechargement de Vite et de nodemon).

### Commandes utiles

```bash
docker compose ps                    # état des services
docker compose logs -f back          # logs de l'API (ou front, postgres, mongo)
docker compose restart back          # redémarrer un service
docker compose stop                  # arrêter (les données sont conservées)
docker compose down                  # arrêter et supprimer les conteneurs (données conservées)
docker compose down -v               # tout supprimer, Y COMPRIS les bases de données

# Ouvrir un terminal SQL
docker exec -it vitegourmand-postgres psql -U vitegourmand -d vitegourmand
```

### Réinitialiser la base de données

Les scripts SQL ne sont exécutés que lorsque le volume de PostgreSQL est vide. Pour repartir des
données de démonstration :

```bash
# Option 1 : supprimer le volume et redémarrer (recrée tout)
docker compose down -v && docker compose up -d

# Option 2 : relancer les scripts sur la base existante
docker exec -i vitegourmand-postgres psql -U vitegourmand -d vitegourmand < back-end/database/schema.sql
docker exec -i vitegourmand-postgres psql -U vitegourmand -d vitegourmand < back-end/database/seed.sql
```

### Après un `npm install` d'une nouvelle dépendance

Les `node_modules` des conteneurs sont dans des volumes Docker. Après l'ajout d'une dépendance :

```bash
docker compose restart back    # ou front : relance npm ci
```

---

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur (José) | jose@vitegourmand.fr | Admin#Jose2026! |
| Employée | julie.employe@vitegourmand.fr | Employe#2026! |
| Utilisateur | marie.dupont@example.com | Client#2026! |
| Utilisateur | thomas.martin@example.com | Client#2026! |

---

## ✅ Tests automatisés (back-end)

Jest + Supertest : tests unitaires (calcul du prix, validation) et tests de l'API
(inscription, connexion, déconnexion, accès par rôle, création et suivi des commandes).

```bash
docker exec vitegourmand-back npm test
```

Les tests utilisent des bases séparées (`vitegourmand_test` dans PostgreSQL et MongoDB),
recréées depuis `schema.sql` + `seed.sql` à chaque lancement : les données de développement
ne sont jamais modifiées. Le service d'adresses (internet) est simulé.

## 🛠 Lancer sans Docker

Voir [`back-end/README.MD`](back-end/README.MD) et [`front-end/README.md`](front-end/README.md)
(Node.js 20.19+ ou 22.12+, PostgreSQL et MongoDB installés localement).

---

## 🌿 Workflow Git

- `main` : version validée · `develop` : intégration
- Une branche par ticket Jira, créée depuis `develop` : `mmy/<feat|fix|chore>/<KAN-xx>/<tâche>`
  (ex. `mmy/feat/KAN-47/order.form`)
- Commits référencés par le numéro du ticket, merge dans `develop` après test, puis `develop` → `main` par pull request
