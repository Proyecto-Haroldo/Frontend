import { Analysis } from "../../core/models/AnalysisModel";

export type ClientType = "persona" | "empresa";

export type QuestionType = "open" | "single" | "multiple";

export interface Question {
  questionid: number;
  question: string;
  questionType: QuestionType;
  clientType?: ClientType;
  questionnaireName: string;
  questionnaireId: string;
  options: MultipleOptionQuestionAnswer[];
  answersInQuestionnaires: AnswersOfQuestionnaire[];
}

export interface MultipleOptionQuestionAnswer {
  optionanswerid: number;
  answertext: string;
  question: string;
}

export interface AnswersOfQuestionnaire {
  answerId: number;
  question: string;
  answerText: string;
}

export type AnalysisStatus = 'completed' | 'in-progress' | 'pending';

export type ColorSemaforo = Analysis['colorSemaforo'];

// Utility functions for analysis processing
export const mapColorToStatus = (color: ColorSemaforo): AnalysisStatus => {
    return color === 'verde' ? 'completed' : 'in-progress';
};

export const mapColorToProgress = (): number => {
    // All analysis are 50% complete when finished, regardless of color
    // Color indicates severity level, not completion level
    return 50;
};

export const getRiskLevel = (color: ColorSemaforo): string => {
    if (color === 'verde') return 'Bajo';
    if (color === 'amarillo') return 'Moderado';
    return 'Alto'; // rojo
};

export const getRiskDescription = (color: ColorSemaforo): string => {
    if (color === 'verde') return 'Su situación financiera es estable y saludable.';
    if (color === 'amarillo') return 'Su situación requiere algunas mejoras.';
    return 'Su situación requiere atención inmediata.'; // rojo
};

// Format analysis display name with counter
export const formatAnalysisTitle = (categoria: string, conteo: number): string => {
    const formattedCategory = categoria.charAt(0).toUpperCase() + categoria.slice(1).replace(/-/g, ' ');
    return conteo > 1 ? `${formattedCategory} #${conteo}` : formattedCategory;
};

// Calculate total progress when assessor review is available
export const calculateTotalProgress = (
    hasAssessorReview: boolean = false
): number => {
    const analysisProgress = mapColorToProgress();

    if (hasAssessorReview) {
        // When assessor completes review, add the remaining 50%
        return analysisProgress + 50;
    }

    return analysisProgress;
};