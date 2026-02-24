export type ClientType = "persona" | "empresa";

interface IRole {
  id: number;
  name: string;
}

export interface IUser {
  userId: number;
  cedulaOrNIT: string;
  legalName: string;
  clientType: string; // 'persona' o 'empresa'
  email: string;
  password: string;
  sector: string;
  role: IRole;
  phone?: string;    // OJO!! AÑADIR ATRIBUTOS
  address?: string;  // OJO!! AÑADIR ATRIBUTOS
}