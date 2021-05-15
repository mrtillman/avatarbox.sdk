import { container } from "../../Common/container";
import { AvbxClient } from "../../Domain/avbx-client";
import { AvbxIcons } from "../../Domain/avbx-icon";
import { TwitterProfile } from "../../Domain/twitter-profile";
import { TwitterRepository } from "../../Infrastructure/twitter.repository";
import { S3Service } from "../../Services/s3.service";
import { TwitterUserService } from "../../Services/twitter-user.service";

export class AvbxTwitterClient implements AvbxClient {
  public user: TwitterUserService;
  public token: string;
  public tokenSecret: string;
  public s3: S3Service.AvbxIcons;
  public repo: TwitterRepository;

  constructor(token: string, tokenSecret: string) {
    this.token = token;
    this.tokenSecret = tokenSecret;
    this.user = container.resolve("twitterUserService");
    this.s3 = container.resolve("s3");
    this.repo = container.resolve("twitterRepo");
  }

  async sync(twitterProfile: TwitterProfile): Promise<void> {
    const profileId = twitterProfile.id;
    const profile = await this.user.find(profileId);
    if (profile) {
      await this.user.update(twitterProfile);
    } else {
      await this.user.save(twitterProfile);
    }
    await this.s3.putIcon(twitterProfile.avatars[0], profileId);
  }

  async isActive(id: string): Promise<Boolean> {
    const user = await this.user.find(id);
    return user ? user.isActive : false;
  }
  async fetch(id: string): Promise<TwitterProfile | null> {
    return await this.user.find(id);
  }
  async on(id: string): Promise<void> {
    return await this.user.on(id);
  }
  async off(id: string): Promise<void> {
    return await this.user.off(id);
  }
  async delete(...profiles: TwitterProfile[]): Promise<void> {
    const profileIds = profiles.map((user) => user.id);
    await this.s3.deleteIcons(...profileIds);
    await this.user.delete(...profiles);
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
  sweep(days: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  touch(...email: string[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  reset(icon: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
