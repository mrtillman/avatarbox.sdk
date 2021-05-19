import {
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  ScanCommandOutput,
  ServiceOutputTypes,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDbCalendar } from "../Common/calendar";
import { AvbxIcon, AvbxIcons } from "../Domain/avbx-icon";

export class DynamoDBService {
  public calendar: DynamoDbCalendar;
  public client: DynamoDBClient;
  protected _tableName: string;
  private _region: string;

  constructor() {
    this._region = process.env.REGION as string;
    this.calendar = new DynamoDbCalendar();
    this.client = new DynamoDBClient({
      region: this._region || "us-east-1",
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
  protected async query(command: QueryCommand): Promise<ScanCommandOutput> {
    return await this.client.send(command);
  }
  protected async batchWrite(
    command: BatchWriteItemCommand
  ): Promise<BatchWriteItemCommandOutput> {
    return await this.client.send(command);
  }
  public async collect(): Promise<AvbxIcons> {
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
    return await this._imageScan(command);
  }

  public async peek(): Promise<AvbxIcons> {
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

  public async dig(days: number): Promise<AvbxIcons> {
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

  private async _imageScan(
    command: ScanCommand
  ): Promise<AvbxIcons> {
    const result = await this.scan(command);
    if (result.Items && result.Items.length) {
      let source = "gravatar";
      if(/twitter/i.test(this._tableName)) source = "twitter";
      return result.Items.map(
        (item) =>
          ({
            id: item.id.N as string,
            imageUrl: `https://icons.avatarbox.io/u/${item.id.N}`,
            lastUpdated: new Date(parseInt(item.last_updated.N as string)),
            isActive: item.is_active.BOOL,
            source
          } as AvbxIcon)
      );
    }
    return null;
  }
}
