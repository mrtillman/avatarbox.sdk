import { container } from "../../Common/container";
import { AvbxClient } from "../../Domain/avbx-client";
import { AvbxIcon, AvbxIcons } from "../../Domain/avbx-icon";
import { TwitterProfile } from "../../Domain/twitter-profile";
import { TwitterRepository } from "../../Infrastructure/twitter.repository";
import { S3Service } from "../../Services/s3.service";
import { SQSService } from "../../Services/sqs.service";
import { TwitterUserService } from "../../Services/twitter-user.service";

export class AvbxTwitterClient implements AvbxClient {
  public user: TwitterUserService;
  public token: string;
  public tokenSecret: string;
  public s3: S3Service.AvbxIcons;
  public sqs: SQSService;
  public repo: TwitterRepository;
  public profile: TwitterProfile;

  constructor() {
    this.user = container.resolve("twitterUserService");
    this.s3 = container.resolve("s3");
    this.sqs = container.resolve("sqs");
    this.repo = container.resolve("twitterRepo");
  }

  async sync(twitterProfile: TwitterProfile): Promise<TwitterProfile | null> {
    const profileId = twitterProfile.id;
    const profile = await this.user.find(profileId);
    if (profile) {
      await this.user.update(twitterProfile);
    } else {
      await this.user.save(twitterProfile);
      if (twitterProfile.avatars) {
        await this.s3.putIcon(twitterProfile.avatars[0], profileId);
      }
    }
    this.profile = twitterProfile;
    return await this.fetch(profileId);
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
  public touch(...icons: AvbxIcon[]): Promise<any> {
    return this.sqs.touch(...icons);
  }
  async reset(icon: AvbxIcon): Promise<void> {
    const user = (await this.user.find(icon.id)) as TwitterProfile;
    const index = (Number(user.currentAvatarIndex) + 1) % user.avatars.length;
    await this.s3.putIcon(icon.imageUrl, user.id);
    await this.repo.reset(user.id, index);
  }
}
