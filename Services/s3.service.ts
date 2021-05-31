import * as https from "https";
import {
  S3Client,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ServiceOutputTypes,
  PutObjectCommand,
  DeleteObjectsCommandOutput,
  ObjectIdentifier,
} from "@aws-sdk/client-s3";
import { UnixCalendar } from "../Common/calendar";

class S3ServiceBase {
  protected _client: S3Client;
  protected _bucketName: string;

  constructor() {
    this._bucketName = "icons.avatarbox.io";
    this._client = new S3Client({
      region: process.env.REGION as string,
    });
  }

  protected async delete(
    command: DeleteObjectCommand
  ): Promise<ServiceOutputTypes> {
    return await this._client.send(command);
  }

  protected async put(command: PutObjectCommand): Promise<ServiceOutputTypes> {
    return await this._client.send(command);
  }
}

export namespace S3Service {
  export class AvbxIcons extends S3ServiceBase {
    private _calendar: UnixCalendar;

    constructor() {
      super();
      this._calendar = new UnixCalendar();
    }

    public async deleteIcon(
      key: string
    ): Promise<DeleteObjectsCommandOutput | null> {
      if (!key) return null;

      const command = new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      });

      return await this._client.send(command);
    }
    public async putIcon(
      imageUrl: string,
      timestamp: string = ""
    ): Promise<string> {
      return new Promise<string>(async (resolve, reject) => {
        https
          .request(imageUrl, async (response) => {
            try {
              const _timestamp = timestamp ? timestamp : this._calendar.now();
              const contentLength = response.headers[
                "content-length"
              ] as string;
              const contentType = response.headers["content-type"] as string;

              const command = new PutObjectCommand({
                Bucket: this._bucketName,
                ACL: "public-read",
                Key: `u/${_timestamp}`,
                ContentType: contentType,
                ContentLength: Number(contentLength),
                Body: response,
              });

              await this._client.send(command);
              resolve(`https://icons.avatarbox.io/u/${_timestamp}`);
            } catch (error) {
              reject(error);
            }
          })
          .on("error", (err) => {
            reject(err);
          })
          .end();
      });
    }
    public async pushIcon(
      imageUrl: string,
      userId: string = ""
    ): Promise<string> {
      return new Promise<string>(async (resolve, reject) => {
        https
          .request(imageUrl, async (response) => {
            try {
              const timestamp = this._calendar.now();
              const key = `u/${userId}/${timestamp}`;
              const contentLength = response.headers[
                "content-length"
              ] as string;
              const contentType = response.headers["content-type"] as string;
              const command = new PutObjectCommand({
                Bucket: this._bucketName,
                ACL: "public-read",
                Key: key,
                ContentType: contentType,
                ContentLength: Number(contentLength),
                Body: response,
              });
              await this._client.send(command);
              resolve(`https://icons.avatarbox.io/${key}`);
            } catch (error) {
              reject(error);
            }
          })
          .on("error", (err) => {
            reject(err);
          })
          .end();
      });
    }
    public async deleteIcons(...userIds: string[]): Promise<void> {
      if (userIds.length == 1) {
        await this.deleteIcon(`u/${userIds[0]}`);
        return;
      }
      const keys = userIds.map((userId) => `u/${userId}`);
      const command = new DeleteObjectsCommand({
        Bucket: this._bucketName,
        Delete: {
          Objects: keys.map(
            (key) =>
              ({
                Key: key,
              } as ObjectIdentifier)
          ),
        },
      });
      this._client.send(command);
    }
  }
}
