import { container } from "../Common/container";
import { TwitterProfile } from "../Domain/twitter-profile";
import { TwitterRepository } from "../Infrastructure/twitter.repository";

export class TwitterUserService {
  public repo: TwitterRepository;
  
  constructor() {
    this.repo = container.resolve("twitterRepo");
  }

  async save(profile: TwitterProfile){
    await this.repo.putUser(profile);
    return profile.id;
  }
}