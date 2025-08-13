import argon2 from "argon2";
import generator from "generate-password";
export default class Password {
  static hash(data: string): Promise<string> {
    return argon2.hash(data);
  }
  static compare(hashData: string, data: string): Promise<boolean> {
    return argon2.verify(hashData, data).catch(() => false);
  }

  static generate(): string {
    return generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: "@$!%*?&",
    });
  }
}
