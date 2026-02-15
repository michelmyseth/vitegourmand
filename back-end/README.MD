# EcoRide

EcoRide est une application web dédiée à la promotion de la mobilité durable en facilitant le covoiturage entre utilisateurs. Elle est composée d'un front-end en **Vue.js** et d'un back-end en **Node.js / Express**, avec **MongoDB** et **PostgreSQL** comme bases de données.

---

## 🛠 Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 16 ou supérieure)  
- [npm](https://www.npmjs.com/)  
- [PostgreSQL](https://www.postgresql.org/)  

Assurez-vous que MongoDB et PostgreSQL sont lancés sur vos machines avant de démarrer l'application.

---

## 🔧 Installation
Installer les dépendances du back-end :
```bash
npm install
```
### 📦 Lancer MongoDB avec Docker

Pour lancer MongoDB via Docker, utilisez la commande suivante :

```bash
docker run -d \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  --name mongo-covoiturage \
  mongo:7.0
```

Lancez le serveur en mode développement avec Nodemon :
```bash
npm run dev
```

Le serveur sera accessible sur : http://localhost:3000