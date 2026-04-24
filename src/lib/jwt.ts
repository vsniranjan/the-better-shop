import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return secret;
}

type TokenPayload = {
  id: string;
  role: Role;
};

export function signToken(payload: { id: string; role: Role }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as unknown as TokenPayload;
}
