import {
  BatchWriteItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
  ScanCommand,
  ServiceOutputTypes,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { AvbxIcon } from "../Domain/avbx-icon";
import { GravatarUser } from "../Domain/gravatar-user";
import { DynamoDBService } from "../Services/dynamodb.service";

export class GravatarRepository extends DynamoDBService {
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
        id: result.Item.id.N,
        email: result.Item.email.S,
        emailHash: result.Item.email_hash.S,
        password: result.Item.password.S,
        isActive: result.Item.is_active.BOOL,
        lastUpdated: new Date(parseInt(result.Item.last_updated.N as string)),
      } as GravatarUser;
    }
    return null;
  }

  public async findUserById(id: string): Promise<GravatarUser | null> {
    const command = new QueryCommand({
      TableName: this._tableName,
      IndexName: "index-id-email",
      ExpressionAttributeValues: {
        ":id": {
          N: id,
        },
      },
      KeyConditionExpression: "id = :id",
    });
    const result = (await this.query(command)) as QueryCommandOutput;
    if (result.Count == 0) return null;
    const user = (result.Items && result.Items[0]) as any;
    return (
      user &&
      ({
        id: user.id.N,
        email: user.email.S,
        emailHash: user.email_hash.S,
        password: user.password.S,
        isActive: user.is_active.BOOL,
        lastUpdated: new Date(parseInt(user.last_updated.N)),
      } as GravatarUser)
    );
  }

  public async putUser(user: GravatarUser): Promise<void> {
    const command = new PutItemCommand({
      TableName: this._tableName,
      Item: {
        id: {
          N: user.id,
        },
        email: {
          S: user.email,
        },
        email_hash: {
          S: user.emailHash,
        },
        password: {
          S: user.password,
        },
        last_updated: {
          N: this.calendar.yesterday(),
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

  public async sweep(days: number): Promise<string[]> {
    const scanCommand = new ScanCommand({
      TableName: this._tableName,
      ScanFilter: {
        last_updated: {
          AttributeValueList: [{ N: this.calendar.daysAgo(days) }],
          ComparisonOperator: "LE",
        },
      },
    });
    const scanResult = await this.scan(scanCommand);
    const emails: string[] = [];
    const userIds: string[] = [];
    if (scanResult.Items && scanResult.Items.length) {
      scanResult.Items.forEach((item) => {
        emails.push(item.email.S as string);
        userIds.push(item.id.N as string);
      });
    }
    await this.deleteUsers(emails);
    return userIds;
  }

  public async collect(): Promise<(AvbxIcon | undefined)[] | null> {
    const command = new ScanCommand({
      TableName: this._tableName,
      ScanFilter: {
        last_updated: {
          AttributeValueList: [{ N: this.calendar.yesterday() }],
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
      return result.Items.map(
        (item) =>
          ({
            id: item.id.N as string,
            imageUrl: `https://icons.avatarbox.io/u/${item.id.N}`,
            lastUpdated: new Date(parseInt(item.last_updated.N as string)),
            isActive: item.is_active.BOOL,
          } as AvbxIcon)
      );
    }
    return null;
  }

  public async peek(): Promise<(AvbxIcon | undefined)[] | null> {
    const command = new ScanCommand({
      TableName: this._tableName,
      ScanFilter: {
        last_updated: {
          AttributeValueList: [{ N: this.calendar.hoursAgo(1) }],
          ComparisonOperator: "GT",
        },
      },
    });
    return this._imageScan(command);
  }

  public async dig(days: number): Promise<(AvbxIcon | undefined)[] | null> {
    const command = new ScanCommand({
      TableName: this._tableName,
      ScanFilter: {
        last_updated: {
          AttributeValueList: [{ N: this.calendar.daysAgo(days) }],
          ComparisonOperator: "LE",
        },
      },
    });
    return this._imageScan(command);
  }

  public async activateUser(email: string): Promise<void> {
    const result = await this._toggleUser(email, true);
    console.info(result);
  }

  public async deactivateUser(email: string): Promise<void> {
    const result = await this._toggleUser(email, false);
    console.info(result);
  }

  public async reset(email: string): Promise<void> {
    const today = this.calendar.today();
    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        email: {
          S: email,
        },
      },
      ExpressionAttributeNames: {
        "#L": "last_updated",
      },
      ExpressionAttributeValues: {
        ":l": {
          N: today,
        },
      },
      UpdateExpression: "SET #L = :l",
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

  private async _imageScan(
    command: ScanCommand
  ): Promise<(AvbxIcon | undefined)[] | null> {
    const result = await this.scan(command);
    if (result.Items && result.Items.length) {
      return result.Items.map(
        (item) =>
          ({
            id: item.id.N as string,
            imageUrl: `https://icons.avatarbox.io/u/${item.id.N}`,
            lastUpdated: new Date(parseInt(item.last_updated.N as string)),
            isActive: item.is_active.BOOL,
          } as AvbxIcon)
      );
    }
    return null;
  }
}
