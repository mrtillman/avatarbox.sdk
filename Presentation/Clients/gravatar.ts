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
      await this.dynamo.putUser(user);
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

  public async delete(email: string): Promise<void> {
    const result = await this.dynamo.deleteUser(email);
    console.info(result);
  }
}
