import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";

export class SQSService {
  client: SQSClient;
  constructor() {
    this.client = new SQSClient({
      region: process.env.REGION,
    });
  }

  touch(...emails: string[]): Promise<any> {
    const command = new SendMessageBatchCommand({
      Entries: emails.map((email, id) => ({
        Id: id,
        MessageBody: email,
      } as any)),
      QueueUrl: process.env.QUEUE_URL,
    });
    return this.client.send(command);
  }
}
