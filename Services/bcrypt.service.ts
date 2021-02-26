import * as bcrypt from "bcrypt";

export class BcryptService {
  async hash(plainText: string): Promise<string> {
    const salt = process.env.SALT as string;
    return new Promise((resolve, reject) => {
      bcrypt.hash(plainText, salt, (err, result) => {
        if (err) {
          reject(err);
        }
        return resolve(result);
      });
    });
  }
}
