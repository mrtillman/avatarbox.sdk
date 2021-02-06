import { GravatarClient } from "grav.client";
import { GravatarUser } from "../../Domain/gravatar-user";
import { KMSService } from "../../Services/kms.service";
import { DynamoDBService } from "../../Services/dynamodb.service";
import { SQSService } from "../../Services/sqs.service";

export class AvbxGravatarClient {
  public kms: KMSService;
  public dynamo: DynamoDBService.Gravatar;
  public sqs: SQSService;

  constructor() {
    this.kms = new KMSService(process.env.KMS_KEY_ID as string);
    this.dynamo = new DynamoDBService.Gravatar();
    this.sqs = new SQSService();
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
  public async delete(...emails: string[]): Promise<void> {
    if (emails.length == 1) {
      return await this.dynamo.deleteUser(emails[0]);
    }
    return await this.dynamo.deleteUsers(emails);
  }
  public async collect(): Promise<(string | undefined)[] | null> {
    return await this.dynamo.collect();
  }
  public async purge(days: number = 10): Promise<void> {
    return await this.dynamo.purge(days);
  }
  public async touch(email: string): Promise<void> {
    await this.sqs.touch(email);
  }
  public async updateImageHash(
    email: string,
    image_hash: string
  ): Promise<void> {
    await this.dynamo.updateImageHash(email, image_hash);
  }
}
