import { GravatarClient } from "grav.client";
import { GravatarUser } from "../../Domain/gravatar-user";
import { KMSService } from "../../Services/kms.service";
import { DynamoDBService } from "../../Services/dynamodb.service";
import { SQSService } from "../../Services/sqs.service";
import { GravatarIcon } from "../../Domain/gravatar-icon";
import { S3Service } from "../../Services/s3.service";

export class AvbxGravatarClient {
  public kms: KMSService;
  public dynamo: DynamoDBService.Gravatar;
  public sqs: SQSService;
  public s3: S3Service.AvbxIcons;

  constructor() {
    // TODO: create user service
    // this.user = new UserService.Gravatar()
    this.s3 = new S3Service.AvbxIcons();
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
      const user = {
        email,
        emailHash: client.emailHash,
      } as GravatarUser;
      user.password = await this.kms.encrypt(password);
      const exists = await this.dynamo.findUser(user.email);
      if (exists) {
        await this.dynamo.updateUserPassword(user);
        await this.s3.putIcon(`${client.gravatarImageUrl}?s=450`, exists.id);
      } else {
        user.id = this.dynamo.calendar.today();
        await this.dynamo.putUser(user);
        await this.s3.putIcon(`${client.gravatarImageUrl}?s=450`, user.id);
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
    // TODO: also delete (batch delete) user's s3 icons
    if (emails.length == 1) {
      return await this.dynamo.deleteUser(emails[0]);
    }
    return await this.dynamo.deleteUsers(emails);
  }
  public async collect(): Promise<(GravatarIcon | undefined)[] | null> {
    return await this.dynamo.collect();
  }
  public async peek(): Promise<(GravatarIcon | undefined)[] | null> {
    return await this.dynamo.peek();
  }
  public async dig(days: number = 10): Promise<(GravatarIcon | undefined)[] | null> {
    return await this.dynamo.dig(days);
  }
  public async purge(days: number = 10): Promise<void> {
    // TODO: also delete (batch delete) user's s3 icons
    return await this.dynamo.purge(days);
  }
  public async touch(email: string): Promise<void> {
    await this.sqs.touch(email);
  }
  public async renew(email: string, imageUrl: string): Promise<void> {
    // TODO: update user's s3 icon with the incoming imageUrl
    
    // TODO: compute image hash
    const image_hash = ""

    await this.dynamo.renew(email, image_hash);
  }
}
