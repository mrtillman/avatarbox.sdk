import { SQSClient } from "@aws-sdk/client-sqs";

export class SQSService {
  client: SQSClient;
  constructor() {
    this.client = new SQSClient({
      region: process.env.REGION,
    });
  }
}
