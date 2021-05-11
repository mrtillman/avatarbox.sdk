import { container } from '../../Common/container';
import { TwitterProfile } from '../../Domain/twitter-profile';
import { UserService } from '../../Services/user.service';

export class AvbxTwitterClient {
  private _user: UserService.Twitter;
  private _token:string;
  private _tokenSecret:string;

  constructor(token:string, tokenSecret:string){
    this._token = token;
    this._tokenSecret = tokenSecret;
    this._user = container.resolve("userTwitter");
  }

  async sync(twitterProfile: TwitterProfile): Promise<void> {
    // TODO: if Twitter user exists update username, token, tokenSecret
    //       otherwise, save
    await this._user.save(twitterProfile);
  }

  on(){

  }

  off(){

  }
  
  addImageFile(imagePath:string){
    
  }
  
  addImageData(blob:string){

  }
  
  removeImage(id:string){

  }

  touch(id:string){
    
  }

  // delete, collect, peek, dig, sweep reset
}