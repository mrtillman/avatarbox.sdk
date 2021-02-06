import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ServiceOutputTypes,
  ScanCommand,
  GetItemCommandOutput,
  ScanCommandOutput,
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { GravatarUser } from "../Domain/gravatar-user";
import { today, yesterday, daysAgo } from "../Common/date.helper";

const _yesterday = function (): string {
  return yesterday().getTime().toString();
};

const _daysAgo = function (days: number): string {
  return daysAgo(days).getTime().toString();
};

const _today = function (): string {
  return today().getTime().toString();
};

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
    protected async update(
      command: UpdateItemCommand
    ): Promise<ServiceOutputTypes> {
      return await this.client.send(command);
    }
    protected async delete(
      command: DeleteItemCommand
    ): Promise<ServiceOutputTypes> {
      return await this.client.send(command);
    }
    protected async scan(command: ScanCommand): Promise<ScanCommandOutput> {
      return await this.client.send(command);
    }
    protected async batchWrite(
      command: BatchWriteItemCommand
    ): Promise<BatchWriteItemCommandOutput> {
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
          last_updated: {
            N: _yesterday(),
          },
          is_active: {
            BOOL: false,
          },
        },
      });
      const result = await this.put(command);
      console.info(result);
    }

    public async updateUserPassword(user: GravatarUser): Promise<void> {
      const command = new UpdateItemCommand({
        TableName: this._tableName,
        Key: {
          email: {
            S: user.email,
          },
        },
        ExpressionAttributeNames: {
          "#P": "password",
        },
        ExpressionAttributeValues: {
          ":p": {
            S: user.password,
          },
        },
        UpdateExpression: "SET #P = :p",
      });
      const result = await this.update(command);
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

    public async deleteUsers(emails: string[]): Promise<void> {
      if (!emails.length) return;
      const batchWriteInput = {
        RequestItems: {
          [this._tableName]: emails.map((email) => ({
            DeleteRequest: {
              Key: { email: { S: email } },
            },
          })),
        },
      };
      const batchCommand = new BatchWriteItemCommand(batchWriteInput);
      const result = await this.batchWrite(batchCommand);
      console.info(result);
    }

    public async purge(days: number): Promise<void> {
      const scanCommand = new ScanCommand({
        TableName: this._tableName,
        ScanFilter: {
          last_updated: {
            AttributeValueList: [{ N: _daysAgo(days) }],
            ComparisonOperator: "LE",
          },
        },
      });
      const scanResult = await this.scan(scanCommand);
      const emails: string[] = [];
      if (scanResult.Items && scanResult.Items.length) {
        scanResult.Items.forEach((item) => {
          emails.push(item.email.S as string);
        });
      }
      await this.deleteUsers(emails);
    }

    public async collect(): Promise<(string | undefined)[] | null> {
      const command = new ScanCommand({
        TableName: this._tableName,
        ScanFilter: {
          last_updated: {
            AttributeValueList: [{ N: _yesterday() }],
            ComparisonOperator: "LE",
          },
          is_active: {
            AttributeValueList: [{ BOOL: true }],
            ComparisonOperator: "EQ",
          },
        },
      });
      const result = await this.scan(command);
      if (result.Items && result.Items.length) {
        return result.Items.map((item) => item.email.S);
      }
      return null;
    }

    public async activateUser(email: string): Promise<void> {
      const result = await this._toggleUser(email, true);
      console.info(result);
    }

    public async deactivateUser(email: string): Promise<void> {
      const result = await this._toggleUser(email, false);
      console.info(result);
    }

    public async updateImageHash(
      email: string,
      image_hash: string
    ): Promise<void> {
      const command = new UpdateItemCommand({
        TableName: this._tableName,
        Key: {
          email: {
            S: email,
          },
        },
        ExpressionAttributeNames: {
          "#I": "image_hash",
          "#L": "last_updated",
        },
        ExpressionAttributeValues: {
          ":i": {
            S: image_hash,
          },
          ":l": {
            N: _today(),
          },
        },
        UpdateExpression: "SET #I = :i, #L = :l",
      });
      const result = await this.update(command);
      console.info(result);
    }

    private async _toggleUser(
      email: string,
      is_active: boolean
    ): Promise<ServiceOutputTypes> {
      const command = new UpdateItemCommand({
        TableName: this._tableName,
        Key: {
          email: {
            S: email,
          },
        },
        ExpressionAttributeNames: {
          "#A": "is_active",
        },
        ExpressionAttributeValues: {
          ":a": {
            BOOL: is_active,
          },
        },
        UpdateExpression: "SET #A = :a",
      });
      return await this.update(command);
    }
  }
}
