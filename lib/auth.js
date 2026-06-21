const bcrypt = require("bcryptjs");
const { SignJWT, jwtVerify } = require("jose");

const COOKIE_NAME = "fr_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// Reads the session cookie from a Next.js Request (app router) and returns { id, role, name, email } or null
async function getSessionFromRequest(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  COOKIE_NAME,
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getSessionFromRequest,
};
