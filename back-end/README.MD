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

Lancer le serveur en mode développement avec Nodemon :
```bash
npm run dev
```

Le serveur sera accessible sur : http://localhost:3000
