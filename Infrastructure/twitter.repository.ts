import {
  BatchWriteItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
  ScanCommand,
  ServiceOutputTypes,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { TwitterProfile } from "../Domain/twitter-profile";
import { DynamoDBService } from "../Services/dynamodb.service";

export class TwitterRepository extends DynamoDBService {
  constructor() {
    super();
    this._tableName = "TwitterProfiles";
  }

  async putUser(profile: TwitterProfile): Promise<void> {
    const command = new PutItemCommand({
      TableName: this._tableName,
      Item: {
        id: {
          N: profile.id,
        },
        username: {
          S: profile.username,
        },
        token: {
          S: profile.token,
        },
        token_secret: {
          S: profile.tokenSecret,
        },
        current_avatar_index: {
          N: "0",
        },
        avatars: {
          SS: profile.avatars,
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

  async updateUser(profile: TwitterProfile): Promise<void> {
    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          N: profile.id,
        },
      },
      ExpressionAttributeNames: {
        "#U": "username",
        "#T": "token",
        "#TS": "token_secret",
      },
      ExpressionAttributeValues: {
        ":u": {
          S: profile.username,
        },
        ":t": {
          S: profile.token,
        },
        ":ts": {
          S: profile.tokenSecret,
        },
      },
      UpdateExpression: "SET #U = :u, #T = :t, #TS = :ts",
    });
    const result = await this.update(command);
    console.info(result);
  }

  async findUser(id: string): Promise<TwitterProfile | null> {
    const command = new GetItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          N: id,
        },
      },
    });
    const result = (await this.get(command)) as GetItemCommandOutput;
    if (result.Item) {
      return {
        id: result.Item.id.N,
        username: result.Item.username.S,
        token: result.Item.token.S,
        tokenSecret: result.Item.token_secret.S,
        isActive: result.Item.is_active.BOOL,
        lastUpdated: new Date(parseInt(result.Item.last_updated.N as string)),
        avatars: result.Item.avatars.SS,
        currentAvatarIndex: Number(result.Item.current_avatar_index.N),
      } as TwitterProfile;
    }
    return null;
  }

  public async activateUser(id: string): Promise<void> {
    const result = await this._toggleUser(id, true);
    console.info(result);
  }

  public async deactivateUser(id: string): Promise<void> {
    const result = await this._toggleUser(id, false);
    console.info(result);
  }

  public async deleteUser(id: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          S: id,
        },
      },
    });
    const result = await this.delete(command);
    console.info(result);
  }

  public async deleteUsers(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const batchWriteInput = {
      RequestItems: {
        [this._tableName]: ids.map((id) => ({
          DeleteRequest: {
            Key: { id: { N: id } },
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
    const profileIds: string[] = [];
    if (scanResult.Items && scanResult.Items.length) {
      scanResult.Items.forEach((item) => {
        profileIds.push(item.id.N as string);
      });
    }
    await this.deleteUsers(profileIds);
    return profileIds;
  }

  private async _toggleUser(
    id: string,
    is_active: boolean
  ): Promise<ServiceOutputTypes> {
    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          N: id,
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

  public async reset(id: string, index: Number): Promise<void> {
    const today = this.calendar.today();
    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          N: id,
        },
      },
      ExpressionAttributeNames: {
        "#L": "last_updated",
        "#X": "current_avatar_index"
      },
      ExpressionAttributeValues: {
        ":l": {
          N: today,
        },
        ":x": {
          N: index.toString(),
        },
      },
      UpdateExpression: "SET #L = :l, #X = :x",
    });
    const result = await this.update(command);
    console.info(result);
  }
}
