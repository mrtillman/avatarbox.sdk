import { config } from 'dotenv';

config();

import { AvbxGravatarClient } from './gravatar';

describe('AvbxGravatarClient', () => {
  let client: AvbxGravatarClient;
  
  beforeEach(() => {
    client = new AvbxGravatarClient();
  })

  it('should work', () => {
    expect(client.fetch).toBeDefined();
  })
})