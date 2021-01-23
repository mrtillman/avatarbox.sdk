import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ServiceOutputTypes,
  GetItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { GravatarUser } from "../Domain/gravatar-user";

export namespace DynamoDBService {
  class DynamoDBServiceBase {
    public client: DynamoDBClient;

    private _region: string;

    constructor() {
      this._region = "us-east-1";
      this.client = new DynamoDBClient({
        region: this._region,
      });
    }
    protected async get(command: GetItemCommand): Promise<ServiceOutputTypes> {
      return await this.client.send(command);
    }
    protected async put(command: PutItemCommand): Promise<ServiceOutputTypes> {
      return await this.client.send(command);
    }
    protected async delete(
      command: DeleteItemCommand
    ): Promise<ServiceOutputTypes> {
      return await this.client.send(command);
    }
  }

  export class Gravatar extends DynamoDBServiceBase {
    private _tableName: string;

    constructor() {
      super();
      this._tableName = "Gravatars";
    }

    public async findUser(email: string): Promise<GravatarUser | null> {
      const command = new GetItemCommand({
        TableName: this._tableName,
        Key: {
          email: {
            S: email,
          },
        },
      });
      const result = (await this.get(command)) as GetItemCommandOutput;
      if (result.Item) {
        return {
          email: result.Item.email.S,
          password: result.Item.password.S,
        } as GravatarUser;
      }
      return null;
    }

    public async putUser(user: GravatarUser): Promise<void> {
      const command = new PutItemCommand({
        TableName: this._tableName,
        Item: {
          email: {
            S: user.email,
          },
          password: {
            S: user.password,
          },
        },
      });
      const result = await this.put(command);
      console.info(result);
    }

    public async deleteUser(email: string): Promise<void> {
      const command = new DeleteItemCommand({
        TableName: this._tableName,
        Key: {
          email: {
            S: email,
          },
        },
      });
      const result = await this.delete(command);
      console.info(result);
    }
  }
}
