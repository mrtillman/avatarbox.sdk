import * as awilix from "awilix";
import { S3Service } from "../Services/s3.service";
import { UserService } from "../Services/user.service";
import { SQSService } from "../Services/sqs.service";
import { DynamoDBService } from "../Services/dynamodb.service";

const container = awilix.createContainer();

container.register({
  s3: awilix.asClass(S3Service.AvbxIcons),
  dynamo: awilix.asClass(DynamoDBService.Gravatar),
  sqs: awilix.asClass(SQSService),
  user: awilix.asClass(UserService.Gravatar),
});

export { container };
