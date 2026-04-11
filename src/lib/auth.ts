import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "careerarc-jwt-" + (process.env.POSTGRES_URL?.slice(-12) || "default-dev-only");

// Admin users — in production, move to database
const ADMIN_USERS = [
  {
    username: "admin",
    // Default password: "careerarc2026" — change via env var ADMIN_PASSWORD_HASH
    passwordHash:
      process.env.ADMIN_PASSWORD_HASH ||
      "$2a$10$placeholder", // Will be set on first login
  },
];

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function generateToken(username: string): string {
  return jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): { username: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string; role: string };
  } catch {
    return null;
  }
}

export function getTokenFromHeader(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  // Also check cookies
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/admin_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export function authenticateRequest(request: Request): { username: string; role: string } | null {
  const token = getTokenFromHeader(request);
  if (!token) return null;
  return verifyToken(token);
}

// --- Portal token types and functions ---

export interface PortalTokenData {
  name: string;
  phone: string;
  role: string;
  [key: string]: string;
}

export function generatePortalToken(data: { name: string; phone: string; role: string; [key: string]: string }): string {
  return jwt.sign(data, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyPortalToken(token: string): PortalTokenData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PortalTokenData;
    return decoded;
  } catch {
    return null;
  }
}

export function getPortalUserFromCookie(request: Request, cookieName: string): PortalTokenData | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  if (!match) return null;
  return verifyPortalToken(match[1]);
}
