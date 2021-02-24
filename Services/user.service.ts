import { KMSService } from "./kms.service";
import { GravatarUser } from "../Domain/gravatar-user";
import { DynamoDBService } from "./dynamodb.service";
import { GravatarClient } from "grav.client";
import { MySqlService } from "../Services/mysql.service";
import { BcryptService } from "./bcrypt.service";

export namespace UserService {
  export class Gravatar {
    public kms: KMSService;
    public dynamo: DynamoDBService.Gravatar;
    public bcrypt: BcryptService;

    constructor() {
      this.kms = new KMSService(process.env.KMS_KEY_ID as string);
      this.bcrypt = new BcryptService();
    }

    public async save(user: GravatarUser): Promise<string> {
      const mysql = new MySqlService.Gravatar();
      user.password = await this.kms.encrypt(user.password);
      const exists = await this.find(user.email);
      let userId = null;
      if (exists) {
        user.id = exists.id;
        await this.dynamo.updateUserPassword(user);
        await mysql.update(user);
        userId = exists.id;
      } else {
        user.id = this.dynamo.calendar.now();
        await this.dynamo.putUser(user);
        user.emailHash = await this.bcrypt.hash(user.emailHash);
        await mysql.save(user);
        userId = user.id;
      }
      mysql.end();
      return userId;
    }
    public async find(email: string): Promise<GravatarUser | null> {
      return await this.dynamo.findUser(email);
    }
    public async getClient(email: string): Promise<GravatarClient> {
      const user = await this.find(email);
      if (!user) return new GravatarClient("", "");
      const password = await this.kms.decrypt(user.password);
      return new GravatarClient(user.email, password);
    }

    public async on(email: string): Promise<void> {
      await this.dynamo.activateUser(email);
    }

    public async off(email: string): Promise<void> {
      await this.dynamo.deactivateUser(email);
    }

    public async delete(...users: GravatarUser[]): Promise<void> {
      const mysql = new MySqlService.Gravatar();

      if (users.length == 1) {
        const user = users[0];
        await mysql.delete(user.id);
        await this.dynamo.deleteUser(user.email);
      } else {
        const emails = users.map((user) => user.email);
        await mysql.delete(...users.map((user) => user.id));
        await this.dynamo.deleteUsers(emails);
      }

      mysql.end();
    }
  }
}
