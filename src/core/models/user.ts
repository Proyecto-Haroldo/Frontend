export type ClientType = "persona" | "empresa";

export type UserStatus = "AUTHORIZED" | "UNAUTHORIZED";

export interface IRole {
  id: number;
  name: string;
}

export interface IUser {
  userId: number;
  cedulaOrNIT: string;
  legalName: string;
  clientType: ClientType;
  email: string;
  password?: string;
  sector: string;
  role: IRole;
  status?: UserStatus;
  phone?: string;
  address?: string;
}