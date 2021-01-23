import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

export class KMSService {

  private _region: string = "us-east-1";
  private _keyId: string;

  constructor(keyId: string){
    this._keyId = keyId;
  }

  public async encrypt(input: string): Promise<string> {
    const client = new KMSClient({
      region: this._region,
    });
    const encryptCommand = new EncryptCommand({
      KeyId: this._keyId,
      Plaintext: Buffer.from(input),
    });
    try {
      let result = await client.send(encryptCommand);
      return Buffer.from(result.CiphertextBlob as any).toString("base64");
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  public async decrypt(input: string): Promise<string> {
    const client = new KMSClient({
      region: this._region,
    });
    const decryptCommand = new DecryptCommand({
      KeyId: this._keyId,
      CiphertextBlob: Buffer.from(input, "base64"),
    });
    try {
      let result = await client.send(decryptCommand);
      return Buffer.from(result.Plaintext as any).toString();
    } catch (error) {
      console.log(error);
      return "";
    }
  }
}