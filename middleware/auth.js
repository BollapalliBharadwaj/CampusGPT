const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, error: "Access denied. Invalid token format." });
    }

    const secret = process.env.JWT_SECRET || "campusgpt_dev_secret_key_2026";
    const decoded = jwt.verify(token, secret);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ success: false, error: "Authentication failed. Invalid or expired token." });
  }
}

module.exports = auth;
