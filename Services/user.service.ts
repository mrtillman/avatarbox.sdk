import { KMSService } from "./kms.service";
import { GravatarUser } from "../Domain/gravatar-user";
import { DynamoDBService } from "./dynamodb.service";
import { GravatarClient } from "grav.client";
import { MySqlService } from "../Services/mysql.service";

export namespace UserService {
  export class Gravatar {
    public kms: KMSService;
    public dynamo: DynamoDBService.Gravatar;

    constructor() {
      this.kms = new KMSService(process.env.KMS_KEY_ID as string);
    }

    public async save(user: GravatarUser): Promise<string> {
      const mysql = new MySqlService.Gravatar();
      user.password = await this.kms.encrypt(user.password);
      const exists = await this.find(user.email);
      let userId = null;
      if (exists) {
        await this.dynamo.updateUserPassword(user);
        await mysql.update(exists.emailHash, user.password);
        userId = exists.id;
      } else {
        user.id = this.dynamo.calendar.now();
        await this.dynamo.putUser(user);
        await mysql.save(user.emailHash, user.password);
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
      if (users.length == 1) {
        return await this.dynamo.deleteUser(users[0].email);
      }
      const emails = users.map((user) => user.email);
      return await this.dynamo.deleteUsers(emails);
    }
  }
}
