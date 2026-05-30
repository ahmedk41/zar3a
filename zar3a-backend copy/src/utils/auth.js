// src/utils/auth.js
import crypto   from "crypto";
import jwt      from "jsonwebtoken";
import bcrypt   from "bcryptjs";

// ── Password ──────────────────────────────────────────────────────────────────

export const hashPassword   = (plain)         => bcrypt.hash(plain, 12);
export const verifyPassword = (plain, hashed) => bcrypt.compare(plain, hashed);

export const generateToken = () => crypto.randomBytes(32).toString("hex");

// ── JWT ───────────────────────────────────────────────────────────────────────
const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "zar3a-access-secret-fallback";
const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "zar3a-refresh-secret-fallback";

export const createAccessToken = (userId, role) =>
  jwt.sign(
    { sub: String(userId), role, type: "access" },
    accessSecret,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "7d" }
  );

export const createRefreshToken = (userId) => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  const token = jwt.sign(
    { sub: String(userId), type: "refresh" },
    refreshSecret,
    { expiresIn }
  );

  // Parse expiry into an absolute Date for DB storage
  const days = expiresIn.endsWith("d") ? parseInt(expiresIn) : 7;
  const expiresAt = new Date(Date.now() + days * 86_400_000);

  return { token, expiresAt };
};

export const decodeAccessToken = (token) => {
  try   { return jwt.verify(token, accessSecret);  }
  catch { return null; }
};

export const decodeRefreshToken = (token) => {
  try   { return jwt.verify(token, refreshSecret); }
  catch { return null; }
};
