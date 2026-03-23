import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const KEY_HEX = process.env.CREDENTIAL_ENCRYPTION_KEY ?? ""

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error(
      "CREDENTIAL_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate one with: openssl rand -hex 32"
    )
  }
  return Buffer.from(KEY_HEX, "hex")
}

export function encrypt(plaintext: string): { encryptedValue: string; iv: string } {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  return {
    encryptedValue: encrypted.toString("hex"),
    iv: iv.toString("hex"),
  }
}

export function decrypt(encryptedValue: string, iv: string): string {
  const key = getKey()
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "hex")),
    decipher.final(),
  ])
  return decrypted.toString("utf8")
}
