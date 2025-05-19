export interface Keyword {
  title: string;
  description: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export type QuestionType = 'open' | 'single' | 'multiple';

export interface Question {
  id: number;
  title: string;
  description: string;
  type: QuestionType;
  options?: QuestionOption[];
  keywords: Keyword[];
}

export interface QuestionnaireData {
  id: string;
  questions: Question[];
}
