require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const sequelize = require('./config/dbSQL'); 
const profileRoutes = require("./routes/profile");
const mongoose = require('mongoose');
const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware"); 

const cookieParser = require("cookie-parser");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true 
}));

app.get('/test', (req, res) => {
  res.json({ message: 'MongoDB test route OK' });
});

app.use('/api/auth', authRoutes);
app.use("/api", profileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('PostgreSQL connection error:', err));