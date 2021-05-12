import { GravatarClient } from "grav.client";
import { container } from "../Common/container";
import { GravatarUser } from "../Domain/gravatar-user";
import { GravatarRepository } from "../Infrastructure/gravatar.repository";
import { BcryptService } from "./bcrypt.service";
import { KMSService } from "./kms.service";
import { MySqlService } from "./mysql.service";

export class GravatarUserService {
  public kms: KMSService;
  public repo: GravatarRepository;
  public bcrypt: BcryptService;

  constructor() {
    this.kms = container.resolve("kms");
    this.repo = container.resolve("gravatarRepo");
    this.bcrypt = container.resolve("bcrypt");
  }

  public async save(user: GravatarUser): Promise<string> {
    user.password = await this.kms.encrypt(user.password);
    const exists = await this.find(user.email);
    let userId = null;
    if (exists) {
      user.id = exists.id;
      await this.repo.updateUserPassword(user);
      userId = exists.id;
    } else {
      const mysql = new MySqlService.Gravatar();
      user.id = this.repo.calendar.now();
      await this.repo.putUser(user);
      user.emailHash = await this.bcrypt.hash(user.emailHash);
      await mysql.save(user);
      userId = user.id;
      mysql.end();
    }
    return userId;
  }
  public async find(email: string): Promise<GravatarUser | null> {
    return await this.repo.findUser(email);
  }
  public async findById(id: string): Promise<GravatarUser | null> {
    return await this.repo.findUserById(id);
  }
  public async getClient(user: GravatarUser | null): Promise<GravatarClient> {
    if (!user) return new GravatarClient("", "");
    const password = await this.kms.decrypt(user.password);
    return new GravatarClient(user.email, password);
  }
  public async on(email: string): Promise<void> {
    await this.repo.activateUser(email);
  }
  public async off(email: string): Promise<void> {
    await this.repo.deactivateUser(email);
  }
  public async delete(...users: GravatarUser[]): Promise<void> {
    const mysql = new MySqlService.Gravatar();

    if (users.length == 1) {
      const user = users[0];
      await mysql.delete(user.id);
      await this.repo.deleteUser(user.email);
    } else {
      const emails = users.map((user) => user.email);
      await mysql.delete(...users.map((user) => user.id));
      await this.repo.deleteUsers(emails);
    }

    mysql.end();
  }
}
