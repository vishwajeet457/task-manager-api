export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  accesstoken?: string;
}
