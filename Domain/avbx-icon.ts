export interface AvbxIcon {
  id: string;
  source: string;
  imageUrl: string;
  lastUpdated: Date;
  isActive: boolean;
}

export type AvbxIcons = (AvbxIcon | undefined)[] | null;
