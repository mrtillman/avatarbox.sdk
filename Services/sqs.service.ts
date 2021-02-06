import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export class SQSService {
  client: SQSClient;
  constructor() {
    this.client = new SQSClient({
      region: process.env.REGION,
    });
  }

  async touch(email: string): Promise<void> {
    const command = new SendMessageCommand({
      MessageBody: email,
      QueueUrl: process.env.QUEUE_URL,
    });
    const result = await this.client.send(command);
    console.log(result);
  }
}
