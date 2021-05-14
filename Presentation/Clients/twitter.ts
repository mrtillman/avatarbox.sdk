import { container } from "../../Common/container";
import { AvbxClient } from "../../Domain/avbx-client";
import { AvbxIcons } from "../../Domain/avbx-icon";
import { AvbxUser } from "../../Domain/avbx-user";
import { TwitterProfile } from "../../Domain/twitter-profile";
import { TwitterUserService } from "../../Services/twitter-user.service";

export class AvbxTwitterClient implements AvbxClient {
  public user: TwitterUserService;
  public token: string;
  public tokenSecret: string;

  constructor(token: string, tokenSecret: string) {
    this.token = token;
    this.tokenSecret = tokenSecret;
    this.user = container.resolve("twitterUserService");
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
  delete(...users: AvbxUser[]): Promise<void> {
    throw new Error("Method not implemented.");
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
