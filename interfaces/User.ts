export interface User {
  firstName: string;
  lastName: string;
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profilePhoto?: string;
  status: string;
  typing: boolean;
  online: boolean;
  lastSeen?: string;
  starredMessages: string[];
  starredGrpMessages: string[];
}
