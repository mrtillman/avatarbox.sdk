export interface TwitterProfile {
  id: string;
  username: string;
  token: string;
  tokenSecret: string;
  isActive: Boolean;
  lastUpdated: Date;
  avatars: string[];
  currentAvatarIndex: Number;
  source: string;
}
