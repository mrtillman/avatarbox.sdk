import * as awilix from "awilix";
import { S3Service } from "../Services/s3.service";
import { UserService } from "../Services/user.service";
import { SQSService } from "../Services/sqs.service";
import { DynamoDBService } from "../Services/dynamodb.service";

const container = awilix.createContainer();

container.register({
  s3: awilix.asClass(S3Service.AvbxIcons),
  // TODO: improve naming convention / design pattern
  //       to distinguish between twitter/gravatar
  dynamo: awilix.asClass(DynamoDBService.Gravatar),
  dynamoTwitter: awilix.asClass(DynamoDBService.Twitter),
  sqs: awilix.asClass(SQSService),
  user: awilix.asClass(UserService.Gravatar),
  userTwitter: awilix.asClass(UserService.Twitter),
});

export { container };
