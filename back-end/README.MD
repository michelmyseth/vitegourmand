# Vite & Gourmand — Back-end

API de l'application Vite & Gourmand (traiteur à Bordeaux). Back-end en **Node.js / Express**, avec **PostgreSQL** (base relationnelle) et **MongoDB** (base non relationnelle).

---

> 💡 Le plus simple est de lancer tout le projet (front, API, PostgreSQL, MongoDB) avec Docker Compose :
> voir le [README principal](../README.md). Cette page décrit le lancement manuel du back-end.

## 🛠 Prérequis

- [Node.js](https://nodejs.org/) (version 20 ou supérieure)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [MongoDB](https://www.mongodb.com/) (ou Docker)

Assurez-vous que MongoDB et PostgreSQL sont lancés avant de démarrer l'application.

---

## 🔧 Installation

Installer les dépendances :
```bash
npm install
```

Créer le fichier `.env` à partir de l'exemple puis renseigner vos valeurs :
```bash
cp .env.example .env
```

### 📦 Lancer MongoDB avec Docker

```bash
docker run -d \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  --name mongo-vitegourmand \
  mongo:7.0
```

### 🐘 Lancer PostgreSQL avec Docker

```bash
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_USER=vitegourmand \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=vitegourmand \
  -v pg-data:/var/lib/postgresql/data \
  --name postgres-vitegourmand \
  postgres:16-alpine
```

Reporter les mêmes valeurs dans `.env` (`PG_USER`, `PG_PASSWORD`, `PG_DB`).

### 🗄 Créer la base et charger les données

Les scripts sont dans `database/` (modèle de données : `docs/data-model.md`) :

| Fichier | Rôle |
|---|---|
| `schema.sql` | Crée toutes les tables, clés et contraintes (supprime les tables existantes avant) |
| `seed.sql` | Insère les données de démonstration (menus, plats, horaires, comptes, commandes, avis) |

```bash
# avec psql installé en local
psql -h localhost -U vitegourmand -d vitegourmand -f database/schema.sql
psql -h localhost -U vitegourmand -d vitegourmand -f database/seed.sql

# ou directement dans le conteneur Docker
docker exec -i postgres-vitegourmand psql -U vitegourmand -d vitegourmand < database/schema.sql
docker exec -i postgres-vitegourmand psql -U vitegourmand -d vitegourmand < database/seed.sql
```

### 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur (José) | jose@vitegourmand.fr | Admin#Jose2026! |
| Employée | julie.employe@vitegourmand.fr | Employe#2026! |
| Utilisateur | marie.dupont@example.com | Client#2026! |
| Utilisateur | thomas.martin@example.com | Client#2026! |

Le compte administrateur ne peut être créé **que par le script SQL** : aucune route de l'API ne le permet, et un trigger PostgreSQL refuse toute création ou promotion d'administrateur en dehors de ce script.

Lancer le serveur en mode développement avec Nodemon :
```bash
npm run dev
```

Le serveur sera accessible sur : http://localhost:3000

---

## 🧱 Architecture de l'API

```
back-end/
├── server.js          # démarrage : connexion PostgreSQL + MongoDB, puis écoute du port
├── app.js             # application Express : middlewares globaux, routes /api, gestion des erreurs
├── config/            # connexions aux bases (db.js = pool PostgreSQL, mongo.js = MongoDB)
├── routes/            # déclaration des routes (URL + middlewares + contrôleur)
├── controllers/       # lisent la requête, appellent le service, renvoient la réponse JSON
├── services/          # règles métier (prix, statuts, droits…)
├── repositories/      # accès aux données : requêtes SQL paramétrées uniquement
├── models/            # modèles MongoDB (statistiques)
├── middlewares/       # authentification, rôles, erreurs
└── utils/             # validation des entrées, erreurs HTTP
```

- **Requêtes préparées** : toutes les requêtes SQL passent par `query(text, params)` avec des paramètres `$1, $2…` ; les valeurs ne sont jamais concaténées dans le SQL (pas d'injection SQL).
- **Transactions** : `withTransaction(fn)` exécute plusieurs requêtes dans une même transaction (ex. commande + stock).
- **Erreurs centralisées** : les services lèvent des `HttpError` (400, 401, 403, 404, 409) ; `middlewares/errorHandler.js` les transforme en réponse `{ error, details }`. Les erreurs inattendues renvoient un 500 sans détail technique.
- **Validation côté serveur** : `utils/validate.js` (email, téléphone, mot de passe, dates…), même si le front-end valide aussi.

Route de test : `GET /api/health` → `{ "status": "ok" }`.
