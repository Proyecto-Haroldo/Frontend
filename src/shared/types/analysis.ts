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

export type ColorSemaforo = 'verde' | 'amarillo' | 'rojo';

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

// Format analysis display name with id
export const formatAnalysisTitle = (category: string, id: number): string => {
    const formattedTitle =
        category.charAt(0).toUpperCase() + category.slice(1);

    return `#${id} - ${formattedTitle}`;
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

// API types for analysis answers and grading
export interface QuestionAnswerDTO {
    questionId: number;
    questionText: string;
    answerText: string;
}

export interface GradeRequest {
    contenidoRevision: string;
    colorSemaforo?: string;
}