import { GravatarClient } from "grav.client";
import { GravatarUser } from "../../Domain/gravatar-user";
import { KMSService } from "../../Services/kms.service";
import { DynamoDBService } from "../../Services/dynamodb.service";

export class AvbxGravatarClient {
  public kms: KMSService;
  public dynamo: DynamoDBService.Gravatar;

  constructor() {
    this.kms = new KMSService(process.env.KMS_KEY_ID as string);
    this.dynamo = new DynamoDBService.Gravatar();
  }

  public async login(
    email: string,
    password: string
  ): Promise<GravatarClient | null> {
    const client = new GravatarClient(email, password);

    try {
      await client.test();
      const user = { email } as GravatarUser;
      user.password = await this.kms.encrypt(password);
      const exists = await this.dynamo.findUser(user.email);
      if (exists) {
        await this.dynamo.updateUserPassword(user);
      } else {
        await this.dynamo.putUser(user);
      }
    } catch (error) {
      console.error(error);
      return null;
    }

    return client;
  }

  public async fetch(email: string): Promise<GravatarClient | null> {
    const user = await this.dynamo.findUser(email);
    if (!user) return null;
    const password = await this.kms.decrypt(user.password);
    const client = new GravatarClient(user.email, password);
    try {
      await client.test();
    } catch (error) {
      console.error(error);
      return null;
    }
    return client;
  }

  public async on(email: string): Promise<void> {
    await this.dynamo.activateUser(email);
  }
  public async off(email: string): Promise<void> {
    await this.dynamo.deactivateUser(email);
  }
  public async delete(email: string): Promise<void> {
    await this.dynamo.deleteUser(email);
  }
  public async collect(): Promise<(string | undefined)[] | null> {
    return await this.dynamo.collect();
  }
}
