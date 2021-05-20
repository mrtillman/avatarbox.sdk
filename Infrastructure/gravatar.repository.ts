import {
  BatchWriteItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
  ServiceOutputTypes,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
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
    const expires_on = this.calendar.daysAhead();
    const command = new UpdateItemCommand({
      TableName: this._tableName,
      Key: {
        email: {
          S: email,
        },
      },
      ExpressionAttributeNames: {
        "#L": "last_updated",
        "#E": "expires_on",
      },
      ExpressionAttributeValues: {
        ":l": {
          N: today,
        },
        ":e": {
          N: expires_on,
        },
      },
      UpdateExpression: "SET #L = :l, #E = :e",
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
