import * as bcrypt from "bcrypt";

export class BcryptService {
  async hash(plainText: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(plainText, 10, (err, result) => {
        if (err) {
          reject(err);
        }
        return resolve(result);
      });
    });
  }
}
