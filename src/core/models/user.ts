import { IQuestion } from "../../shared/types/analysis";

export type ClientType = "persona" | "empresa";

interface IRole {
  id: number;
  name: string;
}

interface ICategory {
  categoryid: number;
  category: string;
  decimalvalue: number;
  questions: IQuestion[];
}

interface IAnswer {
  answerId: number;
  questionnaire: string;
  question: IQuestion;
  answerText: string;
}

interface IQuestionnaire {
  id: number;
  category: ICategory;
  client: string;
  timeWhenSolved: string; // ISO string
  answers: IAnswer[];
  state: string; // 'pending', 'completed', etc.
  recomendacionUsuario: string;
  colorSemaforo: string;
  analisisAsesor: string;
  conteo: number;
}

export interface IUser {
  clientId: number;
  cedulaOrNIT: string;
  legalName: string;
  clientType: string; // 'persona' o 'empresa'
  email: string;
  password: string;
  sector: string;
  role: IRole;
  phone?: string;    // OJO!! AÑADIR ATRIBUTOS
  address?: string;  // OJO!! AÑADIR ATRIBUTOS
  questionnaires: IQuestionnaire[];
}