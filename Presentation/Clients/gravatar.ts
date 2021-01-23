import { GravatarClient } from "grav.client";
import { GravatarUser } from "../../Domain/GravatarUser";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { KMSService } from "../../Services/kms.service";

export class AvbxGravatarClient {
  private _region: string = "us-east-1";

  private _kmsService: KMSService = new KMSService(process.env.KMS_KEY_ID as string);

  public async login(
    email: string,
    password: string
  ): Promise<GravatarClient | null> {
    const client = new GravatarClient(email, password);

    try {
      await client.test();
      const user = { email } as GravatarUser;
      user.password = await this._kmsService.encrypt(password);
      await this._putUser(user);
    } catch (error) {
      console.error(error);
      return null;
    }

    return client;
  }

  public async fetch(email: string): Promise<GravatarClient | null> {
    const user = await this._findUser(email);
    if (!user) return null;
    const password = await this._kmsService.decrypt(user.password);
    const client = new GravatarClient(user.email, password);
    try {
      await client.test();
    } catch (error) {
      console.error(error);
      return null;
    }
    return client;
  }

  private async _putUser(user: GravatarUser): Promise<void> {
    const client = new DynamoDBClient({ region: this._region });

    const command = new PutItemCommand({
      TableName: "Gravatars",
      Item: {
        email: {
          S: user.email,
        },
        password: {
          S: user.password,
        },
      },
    });

    const result = await client.send(command);

    console.info(result);
  }

  private async _findUser(email: string): Promise<GravatarUser | null> {
    const client = new DynamoDBClient({ region: this._region });
    const command = new GetItemCommand({
      TableName: "Gravatars",
      Key: {
        email: {
          S: email,
        },
      },
    });
    const result = await client.send(command);
    if (result.Item) {
      return {
        email: result.Item.email.S,
        password: result.Item.password.S,
      } as GravatarUser;
    }
    return null;
  }

}
