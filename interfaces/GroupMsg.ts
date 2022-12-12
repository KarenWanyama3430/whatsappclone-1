import { Group } from "./Group";
import { User } from "./User";

export interface GroupMsg {
  _id?: string;
  createdAt: string;
  updatedAt?: string;
  from: User;
  group: Group;
  message: string;
  read?: boolean;
  readBy?: {
    _id?: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    readDate: Date;
  }[];
  deliveredTo?: {
    _id?: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    deliveredDate: Date;
  }[];
}
