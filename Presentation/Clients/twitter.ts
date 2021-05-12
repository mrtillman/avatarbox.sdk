import { container } from '../../Common/container';
import { TwitterProfile } from '../../Domain/twitter-profile';
import { TwitterUserService } from '../../Services/twitter-user.service';

export class AvbxTwitterClient {
  public user: TwitterUserService;
  public token:string;
  public tokenSecret:string;

  constructor(token:string, tokenSecret:string){
    this.token = token;
    this.tokenSecret = tokenSecret;
    this.user = container.resolve("twitterUserService");
  }

  async sync(twitterProfile: TwitterProfile): Promise<void> {
    // TODO: if Twitter user exists update username, token, tokenSecret
    //       otherwise, save
    await this.user.save(twitterProfile);
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