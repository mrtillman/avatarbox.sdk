import { container } from "../../Common/container";
import { AvbxGravatarClient } from "./gravatar";
import * as awilix from "awilix";

container.register({
  s3: awilix.asValue({
    putIcon: jest.fn(),
  }),
  dynamo: awilix.asValue({}),
  sqs: awilix.asValue({}),
  user: awilix.asValue({
    save: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    getClient: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }),
});
const userId = 1;
const email = "user1@example.com";
const emailHash = "111d68d06e2d317b5a59c2c6c5bad808";
const password = "letmein";
const mockGravatarClient = () =>
  ({
    test: jest.fn(),
    emailHash,
  } as any);

describe("AvbxGravatarClient", () => {
  let avbxClient: AvbxGravatarClient;
  beforeEach(() => {
    avbxClient = new AvbxGravatarClient();
  });
  afterEach(() => {
    jest.clearAllMocks();
  })
  describe("login", () => {
    it("should save user", async () => {
      const save = avbxClient.user.save as jest.Mock;
      save.mockReturnValue(userId);
      avbxClient.client = mockGravatarClient();

      await avbxClient.login(email, password);

      expect(save.mock.calls[0][0]).toEqual({
        email,
        password,
        emailHash,
      });
    });
    it("should return client", async () => {
      const save = avbxClient.user.save as jest.Mock;
      save.mockReturnValue(userId);
      avbxClient.client = mockGravatarClient();

      const client = await avbxClient.login(email, password);

      expect(client).toBeDefined();
    });
    it("should return null on error", async () => {
      avbxClient.client = mockGravatarClient();
      avbxClient.client.test = jest.fn(
        () =>
          new Promise(() => {
            throw "this is a test";
          })
      );

      const client = await avbxClient.login(email, password);

      expect(client).toBe(null);
    });
  });
  describe("isActive", () => {
    it('should find user by id', async () => {
      const findById = avbxClient.user.findById as jest.Mock;;
      
      await avbxClient.isActive(userId.toString());

      expect(findById.mock.calls.length).toBe(1);
    })
    it('should find user by email', async () => {
      const find = avbxClient.user.find as jest.Mock;;
      
      await avbxClient.isActive(email);

      expect(find.mock.calls.length).toBe(1);
    })
  })
  describe("fetch", () => {
    it('should find user by id', async () => {
      const findById = avbxClient.user.findById as jest.Mock;;
      
      await avbxClient.fetch(userId.toString());

      expect(findById.mock.calls.length).toBe(1);
    })
    it('should find user by email', async () => {
      const find = avbxClient.user.find as jest.Mock;;
      
      await avbxClient.fetch(email);

      expect(find.mock.calls.length).toBe(1);
    })
    it('should return client', async () => {
      const getClient = avbxClient.user.getClient as jest.Mock;
      getClient.mockReturnValue({
        test: jest.fn()
      });

      const result = await avbxClient.fetch(email);

      expect(result).toBeDefined();
    })
    it('should return null on error', async () => {
      const getClient = avbxClient.user.getClient as jest.Mock;
      getClient.mockReturnValue({
        test: () => { throw "this is a test"; }
      });

      const result = await avbxClient.fetch(email);

      expect(result).toBeNull();
    })
  })
  describe("on/off", () => {
    it('should enable auto updates', async () => {
      const on = avbxClient.user.on as jest.Mock;
      on.mockReturnValue({
        test: () => { throw "this is a test"; }
      });

      await avbxClient.on(email);

      expect(on.mock.calls.length).toBe(1);
    })
    it('should disable auto updates', async () => {
      const off = avbxClient.user.off as jest.Mock;
      off.mockReturnValue({
        test: () => { throw "this is a test"; }
      });

      await avbxClient.off(email);

      expect(off.mock.calls.length).toBe(1);
    })
  })
});
