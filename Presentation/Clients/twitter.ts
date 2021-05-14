import { container } from "../../Common/container";
import { AvbxClient } from "../../Domain/avbx-client";
import { AvbxIcons } from "../../Domain/avbx-icon";
import { TwitterProfile } from "../../Domain/twitter-profile";
import { S3Service } from "../../Services/s3.service";
import { TwitterUserService } from "../../Services/twitter-user.service";

export class AvbxTwitterClient implements AvbxClient {
  public user: TwitterUserService;
  public token: string;
  public tokenSecret: string;
  public s3: S3Service.AvbxIcons;

  constructor(token: string, tokenSecret: string) {
    this.token = token;
    this.tokenSecret = tokenSecret;
    this.user = container.resolve("twitterUserService");
    this.s3 = container.resolve("s3");
  }

  async sync(twitterProfile: TwitterProfile): Promise<void> {
    const profile = await this.user.find(twitterProfile.id);
    if (profile) {
      await this.user.update(twitterProfile);
    } else {
      await this.user.save(twitterProfile);
    }
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
  collect(): Promise<AvbxIcons> {
    throw new Error("Method not implemented.");
  }
  peek(): Promise<AvbxIcons> {
    throw new Error("Method not implemented.");
  }
  dig(days: number): Promise<AvbxIcons> {
    throw new Error("Method not implemented.");
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
