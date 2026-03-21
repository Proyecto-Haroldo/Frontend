import { IQuestionnaireResult } from "../types/questionnaire";

export interface IWebAnswer {
    userId: number;
    questionnaireData: IQuestionnaireResult;
}

export interface IRecommendationAI {
    resumenUsuario: string;
    colorSemaforo: string; // 'verde' | 'amarillo' | 'rojo'
    analisisAsesor?: string;
}