import { GravatarClient } from "grav.client";
import { DynamoDBService } from "../../Services/dynamodb.service";
import { SQSService } from "../../Services/sqs.service";
import { GravatarIcon } from "../../Domain/gravatar-icon";
import { S3Service } from "../../Services/s3.service";
import { UserService } from "../../Services/user.service";
import { GravatarUser } from "../../Domain/gravatar-user";

export class AvbxGravatarClient {
  public dynamo: DynamoDBService.Gravatar;
  public sqs: SQSService;
  public s3: S3Service.AvbxIcons;
  public user: UserService.Gravatar;

  constructor() {
    this.s3 = new S3Service.AvbxIcons();
    this.dynamo = new DynamoDBService.Gravatar();
    this.sqs = new SQSService();
    this.user = new UserService.Gravatar();
    this.user.dynamo = this.dynamo;
  }

  public async login(
    email: string,
    password: string
  ): Promise<GravatarClient | null> {
    const client = new GravatarClient(email, password);

    try {
      await client.test();
      const userId = await this.user.save({
        email,
        password,
        emailHash: client.emailHash,
      } as GravatarUser);
      await this.s3.putIcon(`${client.gravatarImageUrl}?s=450`, userId);
    } catch (error) {
      console.error(error);
      return null;
    }

    return client;
  }

  public async fetch(email: string): Promise<GravatarClient | null> {
    const client = await this.user.getClient(email);
    try {
      await client.test();
    } catch (error) {
      console.error(error);
      return null;
    }
    return client;
  }

  public async on(email: string): Promise<void> {
    await this.user.on(email);
  }
  public async off(email: string): Promise<void> {
    await this.user.off(email);
  }
  public async delete(...users: GravatarUser[]): Promise<void> {
    const userIds = users.map((user) => user.id);
    await this.s3.deleteIcons(...userIds);
    await this.user.delete(...users);
  }
  public async collect(): Promise<(GravatarIcon | undefined)[] | null> {
    return await this.dynamo.collect();
  }
  public async peek(): Promise<(GravatarIcon | undefined)[] | null> {
    return await this.dynamo.peek();
  }
  public async dig(
    days: number = 10
  ): Promise<(GravatarIcon | undefined)[] | null> {
    return await this.dynamo.dig(days);
  }
  public async purge(days: number = 10): Promise<void> {
    const userIds = await this.dynamo.purge(days);
    await this.s3.deleteIcons(...userIds);
  }
  public async touch(email: string): Promise<void> {
    await this.sqs.touch(email);
  }
  public async reset(icon: GravatarIcon): Promise<void> {
    const user = (await this.dynamo.findUser(icon.email)) as GravatarUser;
    await this.s3.putIcon(icon.imageUrl, user.id);
    await this.dynamo.reset(user.email);
  }
}
