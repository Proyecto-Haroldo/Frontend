interface Role {
  id: number;
  name: string;
}

interface OptionAnswer {
  optionanswerid: number;
  answertext: string;
  question: string;
}

interface Question {
  questionid: number;
  question: string;
  questionType: string;  // 'open' o cualquier otro tipo
  clientType: string;    // 'persona' o 'empresa'
  category: string;
  options: OptionAnswer[];
}

interface Category {
  categoryid: number;
  category: string;
  decimalvalue: number;
  questions: Question[];
}

interface Answer {
  answerId: number;
  questionnaire: string;
  question: Question;
  answerText: string;
}

interface Questionnaire {
  id: number;
  category: Category;
  client: string;
  timeWhenSolved: string; // ISO string
  answers: Answer[];
  state: string; // 'pending', 'completed', etc.
  recomendacionUsuario: string;
  colorSemaforo: string;
  analisisAsesor: string;
  conteo: number;
}

export interface Client {
  clientId: number;
  cedulaOrNIT: string;
  legalName: string;
  clientType: string; // 'persona' o 'empresa'
  email: string;
  password: string;
  sector: string;
  role: Role;
  phone?: string;    // OJO!! AÑADIR ATRIBUTOS
  address?: string;  // OJO!! AÑADIR ATRIBUTOS
  questionnaires: Questionnaire[];
}