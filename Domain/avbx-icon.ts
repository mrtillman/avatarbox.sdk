export interface AvbxIcon {
  id: string;
  imageUrl: string;
  lastUpdated: Date;
  isActive: boolean;
}

export type AvbxIcons = (AvbxIcon | undefined)[] | null;
