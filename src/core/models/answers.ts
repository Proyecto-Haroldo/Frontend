import { QuestionnaireResult } from "../../shared/types/questionnaire";

export interface WebAnswersDTO {
    userId: number;
    questionnaireData: QuestionnaireResult;
}

export interface AIRecommendationResult {
    resumenUsuario: string;
    colorSemaforo: string; // 'verde' | 'amarillo' | 'rojo'
}