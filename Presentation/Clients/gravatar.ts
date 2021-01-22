import { GravatarClient } from "grav.client";
import { GravatarUser } from "../../Domain/GravatarUser";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

export class AvbxGravatarClient {
  private _region: string = "us-east-1";

  public async login(
    email: string,
    password: string
  ): Promise<GravatarClient | null> {
    const client = new GravatarClient(email, password);

    try {
      await client.test();
      const user = { email } as GravatarUser;
      user.password = await this._encryptPassword(password);
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
    const password = await this._decryptPassword(user.password);
    const client = new GravatarClient(user.email, password);
    try {
      await client.test();
    } catch (error) {
      console.error(error);
      return null;
    }
    return client;
  }

  // #region private methods

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

  private async _encryptPassword(password: string): Promise<string> {
    const client = new KMSClient({
      region: this._region,
    });
    const encryptCommand = new EncryptCommand({
      KeyId: process.env.KMS_KEY_ID,
      Plaintext: Buffer.from(password),
    });
    try {
      let result = await client.send(encryptCommand);
      return Buffer.from(result.CiphertextBlob as any).toString("base64");
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  private async _decryptPassword(password: string): Promise<string> {
    const client = new KMSClient({
      region: this._region,
    });
    const decryptCommand = new DecryptCommand({
      KeyId: process.env.KMS_KEY_ID,
      CiphertextBlob: Buffer.from(password, "base64"),
    });
    try {
      let result = await client.send(decryptCommand);
      return Buffer.from(result.Plaintext as any).toString();
    } catch (error) {
      console.log(error);
      return "";
    }
  }
  //#endregion
}
