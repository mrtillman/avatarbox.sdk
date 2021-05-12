import { BatchWriteItemCommand, BatchWriteItemCommandOutput, DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand, ScanCommandOutput, ServiceOutputTypes, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDbCalendar } from "../Common/calendar";

export class DynamoDBService {
  public calendar: DynamoDbCalendar;
  public client: DynamoDBClient;
  protected _tableName: string;
  private _region: string;

  constructor() {
    this._region = process.env.REGION as string;
    this.calendar = new DynamoDbCalendar();
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
  protected async query(command: QueryCommand): Promise<ScanCommandOutput> {
    return await this.client.send(command);
  }
  protected async batchWrite(
    command: BatchWriteItemCommand
  ): Promise<BatchWriteItemCommandOutput> {
    return await this.client.send(command);
  }
}
