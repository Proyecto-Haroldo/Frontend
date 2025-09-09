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
  type: QuestionType;
  options?: QuestionOption[];
  keywords: Keyword[];
}

export interface QuestionnaireData {
  id: string;
  questions: Question[];
}

export interface QuestionnaireMetadata {
  category: string;
  clientType: string;
  timestamp: string;
}

export interface QuestionnaireAnswer {
  questionId: number;
  questionTitle: string;
  answer: string[];
  type: QuestionType;
}

export interface QuestionnaireResult {
  metadata: QuestionnaireMetadata;
  answers: QuestionnaireAnswer[];
}
