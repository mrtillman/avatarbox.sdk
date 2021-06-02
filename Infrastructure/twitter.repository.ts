import {
  BatchWriteItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
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
          L: profile.avatars.map((imageUrl) => ({
            S: imageUrl,
          })),
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

  async deleteImage(userId: string, imageId: string) {
    const profile = await this.findUser(userId);
    if (!profile) return false;
    let targetIndex = Number(imageId);
    if(targetIndex == profile.currentAvatarIndex) return false;
    if(profile.avatars[profile.currentAvatarIndex] == imageId) return false;
    let avatars: string[] = [];

    if (isNaN(targetIndex)) {
      const rgx = new RegExp(imageId.trim(), "i");
      avatars = profile.avatars.filter(
        (imageUrl: string) => !rgx.test(imageUrl)
      );
    } else if (targetIndex >= 0 && targetIndex < profile.avatars.length) {
      avatars = profile.avatars.filter(
        (imageUrl: string, index: number) => index != targetIndex
      );
    } else {
      return false;
    }

    if (profile.currentAvatarIndex >= avatars.length) {
      profile.currentAvatarIndex = 0;
    } else if (profile.currentAvatarIndex > targetIndex) {
      profile.currentAvatarIndex = (profile.currentAvatarIndex - 1);
    }

    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          N: userId,
        },
      },
      ExpressionAttributeNames: {
        "#A": "avatars",
        "#I": "current_avatar_index"
      },
      ExpressionAttributeValues: {
        ":a": {
          L: avatars.map((imageUrl) => ({
            S: imageUrl,
          })),
        },
        ":i": {
          N: profile.currentAvatarIndex.toString()
        }
      },
      UpdateExpression: "SET #A = :a, #I = :i",
    });

    await this.update(command);

    return avatars[profile.currentAvatarIndex];
  }

  async pushImage(userId: string, imageUrl: string) {
    const profile = await this.findUser(userId);
    if (!profile) return false;
    profile.avatars.push(imageUrl.trim());
    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          N: userId,
        },
      },
      ExpressionAttributeNames: {
        "#A": "avatars",
      },
      ExpressionAttributeValues: {
        ":a": {
          L: profile.avatars.map((imageUrl) => ({
            S: imageUrl,
          })),
        },
      },
      UpdateExpression: "SET #A = :a",
    });
    await this.update(command);
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
        source: "twitter",
        id: result.Item.id.N,
        username: result.Item.username.S,
        token: result.Item.token.S,
        tokenSecret: result.Item.token_secret.S,
        isActive: result.Item.is_active.BOOL,
        lastUpdated: new Date(parseInt(result.Item.last_updated.N as string)),
        avatars: result.Item.avatars.L?.map((avatar) => avatar.S),
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
    const expires_on = this.calendar.daysAhead();
    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        id: {
          N: id,
        },
      },
      ExpressionAttributeNames: {
        "#L": "last_updated",
        "#X": "current_avatar_index",
        "#E": "expires_on",
      },
      ExpressionAttributeValues: {
        ":l": {
          N: today,
        },
        ":x": {
          N: index.toString(),
        },
        ":e": {
          N: expires_on,
        },
      },
      UpdateExpression: "SET #L = :l, #X = :x, #E = :e",
    });
    const result = await this.update(command);
    console.info(result);
  }
}
