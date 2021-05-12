import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { TwitterProfile } from "../Domain/twitter-profile";
import { DynamoDBService } from "../Services/dynamodb.service";

export class TwitterRepository extends DynamoDBService {
  
  constructor() {
    super();
    this._tableName = "TwitterProfiles";
  }

  async putUser(profile: TwitterProfile): Promise<void> {
    const command = new PutItemCommand({
      TableName: this._tableName,
      Item: {
        id: {
          N: profile.id,
        },
        username: {
          S: profile.username,
        },
        token: {
          S: profile.token,
        },
        token_secret: {
          S: profile.tokenSecret,
        },
        current_avatar_index: {
          N: "0",
        },
        avatars: {
          SS: profile.avatars
        },
        last_updated: {
          N: this.calendar.yesterday(),
        },
        is_active: {
          BOOL: false,
        },
      },
    });
    const result = await this.put(command);
    console.info(result);
  }    
}
