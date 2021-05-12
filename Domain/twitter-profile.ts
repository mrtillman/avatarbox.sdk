export interface TwitterProfile {
  id: string;
  username: string;
  token: string;
  tokenSecret: string;
  isActive: boolean;
  lastUpdated: Date;
  avatars: string[];
  currentAvatarIndex: number;
}
