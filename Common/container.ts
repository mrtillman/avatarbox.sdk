import * as awilix from "awilix";
import { S3Service } from "../Services/s3.service";
import { SQSService } from "../Services/sqs.service";
import { GravatarRepository } from "../Infrastructure/gravatar.repository";
import { TwitterRepository } from "../Infrastructure/twitter.repository";
import { GravatarUserService } from "../Services/gravatar-user.service";
import { TwitterUserService } from "../Services/twitter-user.service";
import { BcryptService } from "../Services/bcrypt.service";
import { KMSService } from "../Services/kms.service";

const container = awilix.createContainer();

container.register({
  s3: awilix.asClass(S3Service.AvbxIcons),
  sqs: awilix.asClass(SQSService),
  bcrypt: awilix.asClass(BcryptService),
  gravatarRepo: awilix.asClass(GravatarRepository),
  gravatarUserService: awilix.asClass(GravatarUserService),
  twitterRepo: awilix.asClass(TwitterRepository),
  twitterUserService: awilix.asClass(TwitterUserService),
  kms: awilix.asValue(new KMSService(process.env.KMS_KEY_ID as string)),
});

export { container };
