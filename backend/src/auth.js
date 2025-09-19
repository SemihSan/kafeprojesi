import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "./config.js";

export function signJwt(payload, expiresIn = "7d") {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function authMiddleware(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = verifyJwt(token);
    if (!payload) return res.status(401).json({ message: "Invalid token" });
    if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = payload;
    next();
  };
}


