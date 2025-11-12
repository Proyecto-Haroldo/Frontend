import { IQuestion, QuestionType } from "../../core/models/question";

export interface QuestionnaireData {
  id: string;
  questions: IQuestion[];
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
