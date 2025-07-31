import argon2 from "argon2";

export default class Password {
  static hash(data: string): Promise<string> {
    return argon2.hash(data);
  }
  static compare(hashData: string, data: string): Promise<boolean> {
    return argon2.verify(hashData, data);
  }
}
