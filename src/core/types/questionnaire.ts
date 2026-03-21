import { IQuestion, QuestionType } from "../models/question";

export interface IQuestionnaireData {
  id: string;
  questions: IQuestion[];
}

export interface IQuestionnaireMetadata {
  category: string;
  clientType: string;
  timestamp: string;
  title: string;
}

export interface IQuestionnaireAnswer {
  questionId: number;
  questionTitle: string;
  answer: string[];
  questionType: QuestionType;
}

export interface IQuestionnaireResult {
  metadata: IQuestionnaireMetadata;
  answers: IQuestionnaireAnswer[];
}