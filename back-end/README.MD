# Vite & Gourmand — Back-end

API de l'application Vite & Gourmand (traiteur à Bordeaux). Back-end en **Node.js / Express**, avec **PostgreSQL** (base relationnelle) et **MongoDB** (base non relationnelle).

---

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
