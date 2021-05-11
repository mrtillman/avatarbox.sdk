import { KMSService } from "./kms.service";
import { GravatarUser } from "../Domain/gravatar-user";
import { DynamoDBService } from "./dynamodb.service";
import { GravatarClient } from "grav.client";
import { MySqlService } from "../Services/mysql.service";
import { BcryptService } from "./bcrypt.service";
import { TwitterProfile } from "../Domain/twitter-profile";
import { container } from "../Common/container";

// TODO: put services in own files; 
//       fix all references + breaking changes 

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
      user.password = await this.kms.encrypt(user.password);
      const exists = await this.find(user.email);
      let userId = null;
      if (exists) {
        user.id = exists.id;
        await this.dynamo.updateUserPassword(user);
        userId = exists.id;
      } else {
        const mysql = new MySqlService.Gravatar();
        user.id = this.dynamo.calendar.now();
        await this.dynamo.putUser(user);
        user.emailHash = await this.bcrypt.hash(user.emailHash);
        await mysql.save(user);
        userId = user.id;
        mysql.end();
      }
      return userId;
    }
    public async find(email: string): Promise<GravatarUser | null> {
      return await this.dynamo.findUser(email);
    }
    public async findById(id: string): Promise<GravatarUser | null> {
      return await this.dynamo.findUserById(id);
    }
    public async getClient(user: GravatarUser | null): Promise<GravatarClient> {
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

  export class Twitter {
    public dynamo: DynamoDBService.Twitter;
    
    constructor() {
      this.dynamo = container.resolve("dynamoTwitter");
    }

    async save(profile: TwitterProfile){
      await this.dynamo.putUser(profile);
      return profile.id;
    }
  }
}
