import { GravatarClient } from "grav.client";
import { SQSService } from "../../Services/sqs.service";
import { S3Service } from "../../Services/s3.service";
import { GravatarUser } from "../../Domain/gravatar-user";
import { container } from "../../Common/container";
import { AvbxIcon, AvbxIcons } from "../../Domain/avbx-icon";
import { GravatarRepository } from "../../Infrastructure/gravatar.repository";
import { GravatarUserService } from "../../Services/gravatar-user.service";
import { AvbxClient } from "../../Domain/avbx-client";

export class AvbxGravatarClient implements AvbxClient {
  public repo: GravatarRepository;
  public sqs: SQSService;
  public s3: S3Service.AvbxIcons;
  public user: GravatarUserService;
  public client: GravatarClient;

  constructor() {
    this.s3 = container.resolve("s3");
    this.sqs = container.resolve("sqs");
    this.repo = container.resolve("gravatarRepo");
    this.user = container.resolve("gravatarUserService");
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
  public async collect(): Promise<AvbxIcons> {
    return await this.repo.collect();
  }
  public async peek(): Promise<AvbxIcons> {
    return await this.repo.peek();
  }
  public async dig(days: number = 10): Promise<AvbxIcons> {
    return await this.repo.dig(days);
  }
  public touch(...icons: AvbxIcon[]): Promise<any> {
    return this.sqs.touch(...icons);
  }
  public async reset(icon: AvbxIcon): Promise<void> {
    const user = (await this.user.findById(icon.id)) as GravatarUser;
    await this.s3.putIcon(icon.imageUrl, user.id);
    await this.repo.reset(user.email);
  }
}
