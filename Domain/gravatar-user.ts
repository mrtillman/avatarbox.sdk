export interface GravatarUser {
  id: string;
  email: string;
  emailHash: string;
  password: string;
  isActive: boolean;
  lastUpdated: Date;
  source: string;
}
