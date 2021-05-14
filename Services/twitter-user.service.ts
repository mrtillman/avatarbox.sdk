import { container } from "../Common/container";
import { TwitterProfile } from "../Domain/twitter-profile";
import { TwitterRepository } from "../Infrastructure/twitter.repository";

export class TwitterUserService {
  public repo: TwitterRepository;

  constructor() {
    this.repo = container.resolve("twitterRepo");
  }

  async save(profile: TwitterProfile): Promise<string> {
    await this.repo.putUser(profile);
    return profile.id;
  }

  async update(profile: TwitterProfile): Promise<void> {
    await this.repo.updateUser(profile);
  }

  async find(id: string): Promise<TwitterProfile | null> {
    return await this.repo.findUser(id);
  }

  public async on(id: string): Promise<void> {
    await this.repo.activateUser(id);
  }
  public async off(id: string): Promise<void> {
    await this.repo.deactivateUser(id);
  }
}
