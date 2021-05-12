import { container } from "../../Common/container";
import { AvbxGravatarClient } from "./gravatar";
import * as awilix from "awilix";
import { GravatarIcon } from "../../Domain/gravatar-icon";

container.register({
  kms: awilix.asValue({
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  }),
  s3: awilix.asValue({
    putIcon: jest.fn(),
    deleteIcons: jest.fn(),
  }),
  gravatarRepo: awilix.asValue({
    collect: jest.fn(),
    peek: jest.fn(),
    dig: jest.fn(),
    reset: jest.fn(),
    sweep: jest.fn(),
  }),
  sqs: awilix.asValue({
    touch: jest.fn(),
  }),
  gravatarUserService: awilix.asValue({
    save: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    getClient: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    delete: jest.fn(),
  }),
});
const userId = 1;
const imageUrl =
  "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50";
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
  it("should sweep", async () => {
    const userIds = [1, 2];
    const deleteIcons = avbxClient.s3.deleteIcons as jest.Mock;
    const sweep = avbxClient.repo.sweep as jest.Mock;
    sweep.mockReturnValue(userIds);

    await avbxClient.sweep();

    expect(deleteIcons.mock.calls[0]).toEqual(userIds);
  });
  it("should touch", async () => {
    const touch = avbxClient.sqs.touch as jest.Mock;

    await avbxClient.touch(email);

    expect(touch.mock.calls[0]).toEqual([email]);
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
  describe("isActive", () => {
    it("should find user by id", async () => {
      const findById = avbxClient.user.findById as jest.Mock;

      await avbxClient.isActive(userId.toString());

      expect(findById.mock.calls.length).toBe(1);
    });
    it("should find user by email", async () => {
      const find = avbxClient.user.find as jest.Mock;

      await avbxClient.isActive(email);

      expect(find.mock.calls.length).toBe(1);
    });
  });
  describe("fetch", () => {
    it("should find user by id", async () => {
      const findById = avbxClient.user.findById as jest.Mock;

      await avbxClient.fetch(userId.toString());

      expect(findById.mock.calls.length).toBe(1);
    });
    it("should find user by email", async () => {
      const find = avbxClient.user.find as jest.Mock;

      await avbxClient.fetch(email);

      expect(find.mock.calls.length).toBe(1);
    });
    it("should return client", async () => {
      const getClient = avbxClient.user.getClient as jest.Mock;
      getClient.mockReturnValue({
        test: jest.fn(),
      });

      const result = await avbxClient.fetch(email);

      expect(result).toBeDefined();
    });
    it("should return null on error", async () => {
      const getClient = avbxClient.user.getClient as jest.Mock;
      getClient.mockReturnValue({
        test: () => {
          throw "this is a test";
        },
      });

      const result = await avbxClient.fetch(email);

      expect(result).toBeNull();
    });
  });
  describe("on/off", () => {
    it("should enable auto updates", async () => {
      const on = avbxClient.user.on as jest.Mock;

      await avbxClient.on(email);

      expect(on.mock.calls.length).toBe(1);
    });
    it("should disable auto updates", async () => {
      const off = avbxClient.user.off as jest.Mock;

      await avbxClient.off(email);

      expect(off.mock.calls.length).toBe(1);
    });
  });
  describe("delete", () => {
    const users = [{ id: 1 }, { id: 2 }] as any[];
    it("should delete S3 icons", async () => {
      const deleteIcons = avbxClient.s3.deleteIcons as jest.Mock;

      await avbxClient.delete(...users);

      expect(deleteIcons.mock.calls[0]).toEqual([1, 2]);
    });
    it("should delete users", async () => {
      const deleteUser = avbxClient.user.delete as jest.Mock;

      await avbxClient.delete(...users);

      expect(deleteUser.mock.calls[0]).toEqual(users);
    });
  });
  describe("dig", () => {
    it("should dig 10 days by default", async () => {
      const dig = avbxClient.repo.dig as jest.Mock;
      await avbxClient.dig();
      expect(dig.mock.calls[0][0]).toBe(10);
    });
    it("should dig 'x' days", async () => {
      const days = 3;
      const dig = avbxClient.repo.dig as jest.Mock;
      await avbxClient.dig(days);
      expect(dig.mock.calls[0][0]).toBe(days);
    });
  });
  describe("reset", () => {
    beforeEach(() => {
      const find = avbxClient.user.find as jest.Mock;
      find.mockReturnValue({ id: userId, email });
    });
    it("should update S3 icon", async () => {
      const putIcon = avbxClient.s3.putIcon as jest.Mock;

      await avbxClient.reset({
        email,
        imageUrl,
      } as GravatarIcon);

      expect(putIcon.mock.calls[0]).toEqual([imageUrl, userId]);
    });
    it("should update timestamp", async () => {
      const reset = avbxClient.repo.reset as jest.Mock;

      await avbxClient.reset({
        email,
        imageUrl,
      } as GravatarIcon);

      expect(reset.mock.calls[0]).toEqual([email]);
    });
  });
});
