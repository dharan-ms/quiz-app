import bcrypt from "bcryptjs";

import { env } from "../config/env";

export async function hashPassword(rawPassword: string) {
  return bcrypt.hash(rawPassword, env.BCRYPT_ROUNDS);
}

export async function comparePassword(rawPassword: string, hash: string) {
  return bcrypt.compare(rawPassword, hash);
}
