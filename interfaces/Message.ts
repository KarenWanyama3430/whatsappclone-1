import { User } from "./User";

export interface Message {
  from: User;
  to: User;
  message: string;
  createdAt: string;
  updatedAt?: string;
  read: boolean;
  _id?: string;
  chatId?: string;
  secondTick: boolean;
  deliveredDate: string;
  readDate: string;
  count?: number;
}
