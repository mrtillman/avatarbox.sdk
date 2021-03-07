import { container } from "../../Common/container";
import { AvbxGravatarClient } from "./gravatar";
import * as awilix from 'awilix';

container.register({
  s3: awilix.asValue({}),
  dynamo: awilix.asValue({}),
  sqs: awilix.asValue({}),
  user: awilix.asValue({})
})

describe('AvbxGravatarClient', () => {
  let client: AvbxGravatarClient;
  beforeEach(() => {
    client = new AvbxGravatarClient();
  })
  it('should work', () => {
    expect(client.fetch).toBeDefined();
  })
})