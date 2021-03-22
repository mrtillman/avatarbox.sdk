import { GravatarClient } from "grav.client";
import { DynamoDBService } from "../../Services/dynamodb.service";
import { SQSService } from "../../Services/sqs.service";
import { GravatarIcon } from "../../Domain/gravatar-icon";
import { S3Service } from "../../Services/s3.service";
import { UserService } from "../../Services/user.service";
import { GravatarUser } from "../../Domain/gravatar-user";
import { container } from "../../Common/container";
import { AvbxIcon } from "../../Domain/avbx-icon";

export class AvbxGravatarClient {
  public dynamo: DynamoDBService.Gravatar;
  public sqs: SQSService;
  public s3: S3Service.AvbxIcons;
  public user: UserService.Gravatar;
  public client: GravatarClient;

  constructor() {
    this.s3 = container.resolve("s3");
    this.dynamo = container.resolve("dynamo");
    this.sqs = container.resolve("sqs");
    this.user = container.resolve("user");
    this.user.dynamo = this.dynamo;
  }

  public async login(
    email: string,
    password: string
  ): Promise<GravatarClient | null> {
    if (!this.client) {
      this.client = new GravatarClient(email, password);
    }

    const { client } = this;

    try {
      await client.test();
      const userId = await this.user.save({
        email,
        password,
        emailHash: client.emailHash,
      } as GravatarUser);
      await this.s3.putIcon(`${client.gravatarImageUrl}?s=450`, userId);
    } catch (error) {
      return null;
    }

    return client;
  }

  public async isActive(id: string): Promise<Boolean> {
    const user = isNaN(parseInt(id))
      ? await this.user.find(id)
      : await this.user.findById(id);
    return user ? user.isActive : false;
  }

  public async fetch(id: string): Promise<GravatarClient | null> {
    const user = isNaN(parseInt(id))
      ? await this.user.find(id)
      : await this.user.findById(id);
    const client = await this.user.getClient(user);
    try {
      await client.test();
    } catch (error) {
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
  public async collect(): Promise<(AvbxIcon | undefined)[] | null> {
    return await this.dynamo.collect();
  }
  public async peek(): Promise<(AvbxIcon | undefined)[] | null> {
    return await this.dynamo.peek();
  }
  public async dig(
    days: number = 10
  ): Promise<(AvbxIcon | undefined)[] | null> {
    return await this.dynamo.dig(days);
  }
  public async sweep(days: number = 10): Promise<void> {
    const userIds = await this.dynamo.sweep(days);
    await this.s3.deleteIcons(...userIds);
  }
  public async touch(email: string): Promise<void> {
    await this.sqs.touch(email);
  }
  public async reset(icon: GravatarIcon): Promise<void> {
    const user = (await this.user.find(icon.email)) as GravatarUser;
    await this.s3.putIcon(icon.imageUrl, user.id);
    await this.dynamo.reset(user.email);
  }
}
