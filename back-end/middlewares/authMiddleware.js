const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "monsecret";

function authMiddleware(req, res, next) {
  const token = req.cookies.token; 
  if (!token) return res.status(401).json({ error: "Vous n'avez pas accès à cette ressource" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Vous n'avez pas accès à cette ressource" });
  }
}

module.exports = authMiddleware;
