import crypto from "crypto";

const ENCRYPTION_KEY = process.env.KEY_SECRET!; // deve essere 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("KEY_SECRET environment variable is not set");
  }

  if (Buffer.from(ENCRYPTION_KEY, "base64").length !== 32) {
    throw new Error("KEY_SECRET must be 32 bytes when base64 decoded");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "base64"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("KEY_SECRET environment variable is not set");
  }

  const [ivHex, encrypted] = text.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "base64"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Utility per generare una chiave di crittografia sicura
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("base64");
}
