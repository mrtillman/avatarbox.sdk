import { container } from "../../Common/container";
import { AvbxTwitterClient } from "./twitter";
import * as awilix from "awilix";

container.register({
  kms: awilix.asValue({
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  }),
  s3: awilix.asValue({
    putIcon: jest.fn(),
    deleteIcons: jest.fn(),
  }),
  twitterRepo: awilix.asValue({
    collect: jest.fn(),
    peek: jest.fn(),
    dig: jest.fn(),
    reset: jest.fn(),
  }),
  sqs: awilix.asValue({
    touch: jest.fn(),
  }),
  twitterUserService: awilix.asValue({
    save: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    getClient: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    delete: jest.fn(),
  }),
});
const userId = "asdf";
const imageUrl = "https://via.placeholder.com/300";
const mockTwitterClient = () => ({} as any);

describe("AvbxTwitterClient", () => {
  let avbxClient: AvbxTwitterClient;
  beforeEach(() => {
    avbxClient = new AvbxTwitterClient();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should collect", async () => {
    const collect = avbxClient.repo.collect as jest.Mock;
    collect.mockReturnValue(1);

    const result = await avbxClient.collect();

    expect(result).toBeDefined();
  });
  it("should peek", async () => {
    const peek = avbxClient.repo.peek as jest.Mock;
    peek.mockReturnValue(1);

    const result = await avbxClient.collect();

    expect(result).toBeDefined();
  });
  it("should touch", async () => {
    const touch = avbxClient.sqs.touch as jest.Mock;

    await avbxClient.touch(userId);

    expect(touch.mock.calls[0]).toEqual([userId]);
  });
});
