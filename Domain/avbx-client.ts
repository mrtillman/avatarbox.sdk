import { AvbxIcon, AvbxIcons } from "./avbx-icon";
import { AvbxUser } from "./avbx-user";

export interface AvbxClient {
  isActive(id: string): Promise<Boolean>;
  fetch(id: string): Promise<any>;
  on(id: string): Promise<void>;
  off(id: string): Promise<void>;
  delete(...users: AvbxUser[]): Promise<void>;
  collect(): Promise<AvbxIcons>;
  peek(): Promise<AvbxIcons>;
  dig(days: number): Promise<AvbxIcons>;
  touch(...icon: AvbxIcon[]): Promise<any>;
  reset(icon: AvbxIcon): Promise<void>;
}
