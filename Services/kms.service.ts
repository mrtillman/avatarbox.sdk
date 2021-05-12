import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

export class KMSService {
  public kmsClient: KMSClient;

  private _keyId: string;

  constructor(keyId: string) {
    this._keyId = keyId;
    this.kmsClient = new KMSClient({
      region: process.env.REGION || "us-east-1",
    });
  }

  public async encrypt(input: string): Promise<string> {
    const encryptCommand = new EncryptCommand({
      KeyId: this._keyId,
      Plaintext: Buffer.from(input),
    });
    try {
      let result = await this.kmsClient.send(encryptCommand);
      return Buffer.from(result.CiphertextBlob as any).toString("base64");
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  public async decrypt(input: string): Promise<string> {
    const decryptCommand = new DecryptCommand({
      KeyId: this._keyId,
      CiphertextBlob: Buffer.from(input, "base64"),
    });
    try {
      let result = await this.kmsClient.send(decryptCommand);
      return Buffer.from(result.Plaintext as any).toString();
    } catch (error) {
      console.log(error);
      return "";
    }
  }
}
