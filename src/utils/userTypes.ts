// src/utils/userTypes.ts
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  isAdmin: boolean; // This was missing
  address?: string;
}