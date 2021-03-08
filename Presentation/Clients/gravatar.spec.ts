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
});
