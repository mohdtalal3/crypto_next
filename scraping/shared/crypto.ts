import "server-only";

import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";

const PASSWORD = "default-password";
const ITERATIONS = 150_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function key(salt: Buffer) {
  return pbkdf2Sync(PASSWORD, salt, ITERATIONS, 32, "sha256");
}

export function decryptAurum(encrypted: string): Record<string, unknown> {
  const raw = Buffer.from(encrypted, "base64");
  if (raw.length <= SALT_LENGTH + IV_LENGTH + 16) throw new Error("Aurum response payload is malformed.");
  const salt = raw.subarray(0, SALT_LENGTH);
  const iv = raw.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const payloadAndTag = raw.subarray(SALT_LENGTH + IV_LENGTH);
  const tag = payloadAndTag.subarray(-16);
  const ciphertext = payloadAndTag.subarray(0, -16);
  const decipher = createDecipheriv("aes-256-gcm", key(salt), iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")) as Record<string, unknown>;
}

export function encryptAurum(payload: Record<string, unknown>) {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key(salt), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([salt, iv, ciphertext, cipher.getAuthTag()]).toString("base64");
}
