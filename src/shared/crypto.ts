import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM dùng IV 12 bytes
const TAG_LENGTH = 16;

export class CryptoAES256GCM {
  constructor(private keyBase64: string) {}

  encrypt(text: string): string {
    return CryptoAES256GCM.encrypt(text, this.keyBase64);
  }

  decrypt(encryptedBase64URL: string): string {
    return CryptoAES256GCM.decrypt(encryptedBase64URL, this.keyBase64);
  }

  static encrypt(text: string, keyBase64: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(keyBase64, "base64");

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag(); // lấy authentication tag

    // Trả về base64: iv.encrypted.tag
    return Buffer.concat([iv, encrypted, tag]).toString("base64url");
  }

  static decrypt(encryptedBase64URL: string, keyBase64: string): string {
    const data = Buffer.from(encryptedBase64URL, "base64url");
    const key = Buffer.from(keyBase64, "base64");

    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(data.length - TAG_LENGTH);
    const encryptedText = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}
