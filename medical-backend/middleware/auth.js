const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

function authMiddleware(req, res, next) {
  // Check if Authorization header is present
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "UNAUTHORIZED", "No token provided, authorization denied", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach the user (id, role) to the request object
    req.user = decoded;
    
    next();
  } catch (err) {
    return sendError(res, "UNAUTHORIZED", "Token is not valid", 401);
  }
}

module.exports = authMiddleware;
