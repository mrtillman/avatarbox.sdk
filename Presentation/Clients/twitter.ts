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
      // TODO: update username, token, tokenSecret
      console.log(profile);
    } else {
      await this.user.save(twitterProfile);
    }
  }

  async isActive(id: string): Promise<Boolean> {
    const user = await this.user.find(id);
    return user ? user.isActive : false;
  }
  fetch(id: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  on(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  off(id: string): Promise<void> {
    throw new Error("Method not implemented.");
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
