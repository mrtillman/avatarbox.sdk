import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export class SQSService {
  client: SQSClient;
  constructor() {
    this.client = new SQSClient({
      region: process.env.REGION,
    });
  }

  touch(email: string): Promise<any> {
    const command = new SendMessageCommand({
      MessageBody: email,
      QueueUrl: process.env.QUEUE_URL,
    });
    return this.client.send(command);
  }
}
