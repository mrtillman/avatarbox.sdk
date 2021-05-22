import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { AvbxIcon } from "../Domain/avbx-icon";

export class SQSService {
  client: SQSClient;
  constructor() {
    this.client = new SQSClient({
      region: process.env.REGION,
    });
  }

  touch(...icons: AvbxIcon[]): Promise<any> {
    const command = new SendMessageBatchCommand({
      Entries: icons.map(
        ({ id, source }) =>
          ({
            Id: id,
            MessageBody: [id, source].join(","),
          } as any)
      ),
      QueueUrl: process.env.QUEUE_URL,
    });
    return this.client.send(command);
  }
}
