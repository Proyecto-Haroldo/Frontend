import { apiClient } from './apiClient';
import { IAnalysis } from '../core/models/analysis';
import { IQuestionnaire } from '../core/models/questionnaire';
import { IQuestion, QuestionType } from '../core/models/question';
import { AIRecommendationResult, WebAnswersDTO } from '../core/models/answers';
import type { QuestionnaireResult } from '../shared/types/questionnaire';
import type { QuestionAnswerDTO, GradeRequest } from '../shared/types/analysis';

const normalizeQuestionType = (value?: string): QuestionType => {
    switch (value?.toLowerCase()) {
        case 'single':
            return 'single';
        case 'multiple':
            return 'multiple';
        case 'open':
            return 'open';
        default:
            return 'open';
    }
};

const mapQuestionFromDTO = (question: any): IQuestion => {
    const options =
        question.options
            ?.filter((option: any) => option != null)
            .map((option: any) => ({
                id: typeof option.id === 'string' ? Number(option.id) : (option.id || 0),
                text: option.text ?? ''
            })) ?? [];

    const keywords =
        (question.keywords ?? [])
            .map((keyword: any) => ({
                title: keyword?.title ?? '',
                description: keyword?.description ?? ''
            }))
            .filter((keyword: { title: string; description: string }) => keyword.title);

    return {
        id: question.id || 0,
        categoryId: question.categoryId,
        categoryName: question.categoryName,
        question: question.question || question.title || '',
        questionType: normalizeQuestionType(question.questionType),
        questionnaireId: question.questionnaireId,
        options: options.length > 0 ? options : undefined,
        keywords
    };
};

export function formatAnalysisText(text: string) {
    if (!text) return "No disponible";

    let formatted = text.trim();

    // -----------------------------
    // NORMALIZAR TEXTO DE IA
    // -----------------------------

    formatted = formatted.replace(/(\S)\s(\d+\.\s)/g, "$1\n$2");
    formatted = formatted.replace(/(\S)\s\*\s/g, "$1\n* ");
    formatted = formatted.replace(/\*\*(.*?)\*\*:/g, "\n\n**$1:**");
    formatted = formatted.replace(/\n{3,}/g, "\n\n");
    formatted = formatted.replace(/\s\*\s/g, "\n* ");

    // -----------------------------
    // CAPITALIZAR PRIMERA LETRA
    // -----------------------------

    formatted = formatted.replace(/^([a-záéíóúñ])/i, (match) =>
        match.toUpperCase()
    );

    // -----------------------------
    // NEGRILLA
    // -----------------------------

    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // -----------------------------
    // LISTAS CON *
    // -----------------------------

    formatted = formatted.replace(
        /\*\s(.+?)(?=(?:\n\*|\n\d+\.|\n[A-ZÁÉÍÓÚÑ][^:\n]*:|\n\n|$))/gs,
        (_, item) => {
            const clean = item
                .replace(/\n/g, " ")
                .trim();

            return `<ul class="list-disc pl-5"><li>${clean}</li></ul>`;
        }
    );


    // -----------------------------
    // LISTAS NUMERADAS
    // -----------------------------

    formatted = formatted.replace(
        /(?:^\d+\. .+(?:\n|$))+/gm,
        (match) => {
            const items = match
                .trim()
                .split("\n")
                .map((line) =>
                    `<li class="mb-2">${line.replace(/^\d+\. /, "").trim()}</li>`
                )
                .join("");

            return `<ol class="list-decimal pl-5">${items}</ol>`;
        }
    );

    // -----------------------------
    // BADGES SEMÁFORO
    // -----------------------------

    formatted = formatted.replace(/\b(verde|amarillo|rojo)\b/gi, (match) => {
        const color = match.toLowerCase();

        let badgeClass = "";

        if (color === "verde") badgeClass = "badge-success";
        if (color === "amarillo") badgeClass = "badge-warning";
        if (color === "rojo") badgeClass = "badge-error";

        return `<span class="badge my-2 text-sm capitalize ${badgeClass}">${match}</span>`;
    });

    // -----------------------------
    // SALTOS DE LÍNEA
    // -----------------------------

    formatted = formatted.replace(/\n/g, "<br>");

    // =============================
    // SEGUNDA PASADA DE SEGURIDAD
    // =============================

    // solo si no hay listas ya generadas
    if (formatted.includes("*") && !formatted.includes("<ul")) {
        formatted = formatted.replace(/\*\s+([^\n<br>]+)/g, (_, item) => {

            const content = item.trim();

            if (!content) return "";

            return `<ul class="list-disc pl-5"><li class="mb-2">${content}</li></ul>`;
        });
    }

    return formatted;
}

// ---------------------- ANALYSIS ----------------------
export const getAllAnalysis = async (): Promise<IAnalysis[]> => {
    try {
        const response = await apiClient.get<IAnalysis[]>('/analysis/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching all analysis:', error);
        throw new Error('Failed to fetch all analysis');
    }
};

export const getAnalysisById = async (id: number): Promise<IAnalysis> => {
    try {
        const response = await apiClient.get<IAnalysis>(`/analysis/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching analysis by id:', error);
        throw new Error('Error al obtener el análisis por id');
    }
};

export const getPendingAnalysis = async (): Promise<IAnalysis[]> => {
    try {
        const response = await apiClient.get<IAnalysis[]>('/analysis/pending');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending analysis:', error);
        throw new Error('Failed to fetch pending analysis');
    }
};

export const getCheckedAnalysis = async (): Promise<IAnalysis[]> => {
    try {
        const response = await apiClient.get<IAnalysis[]>('/analysis/proofread');
        return response.data;
    } catch (error) {
        console.error('Error fetching checked analysis:', error);
        throw new Error('Failed to fetch checked analysis');
    }
};

export const getUserAnalysis = async (userId: number): Promise<IAnalysis[]> => {
    try {
        const response = await apiClient.get<IAnalysis[]>(`/analysis/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user analysis:', error);
        throw new Error('Error al obtener los análisis del usuario');
    }
};

export const getUserAnalysisByCategory = async (userId: number, category: string): Promise<IAnalysis[]> => {
    try {
        const response = await apiClient.get<IAnalysis[]>(`/analysis/user/${userId}/category/${category}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user analysis by category:', error);
        throw new Error('Error al obtener los análisis del usuario por categoría');
    }
};

export const getAdviserAnalysis = async (adviserId: number): Promise<IAnalysis[]> => {
    try {
        const response = await apiClient.get<IAnalysis[]>(`/analysis/adviser/${adviserId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching adviser analysis:', error);
        throw new Error('Error al obtener los análisis del asesor');
    }
};

export const updateAnalysis = async (id: number, analysisDTO: Partial<IAnalysis>): Promise<IAnalysis> => {
    try {
        const response = await apiClient.put<IAnalysis>(`/analysis/${id}`, analysisDTO);
        return response.data;
    } catch (error) {
        console.error('Error updating analysis:', error);
        throw new Error('Error al actualizar el análisis');
    }
};

export const setCheckedAnalysis = async (id: number): Promise<IAnalysis> => {
    try {
        const response = await apiClient.put<IAnalysis>(`/analysis/setChecked/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error setting analysis as checked:', error);
        throw new Error('Error al marcar el análisis como revisado');
    }
};

export const getAnalysisAnswers = async (analysisId: number): Promise<QuestionAnswerDTO[]> => {
    try {
        const response = await apiClient.get<QuestionAnswerDTO[]>(`/analysis/${analysisId}/answers`);
        return response.data;
    } catch (error) {
        console.error('Error fetching analysis answers:', error);
        throw new Error('Error al obtener las respuestas del cuestionario');
    }
};

export const gradeAnalysis = async (analysisId: number, request: GradeRequest): Promise<IAnalysis> => {
    try {
        const response = await apiClient.put<IAnalysis>(`/analysis/${analysisId}/grade`, request);
        return response.data;
    } catch (error) {
        console.error('Error grading analysis:', error);
        throw new Error('Error al enviar la revisión del cuestionario');
    }
};

export const createAnalysis = async (analysisDTO: Partial<IAnalysis>): Promise<IAnalysis> => {
    try {
        const response = await apiClient.post<IAnalysis>('/analysis', analysisDTO);
        return response.data;
    } catch (error) {
        console.error('Error creating analysis:', error);
        throw new Error('Error al crear el análisis');
    }
};

// ---------------------- QUESTIONNAIRE ----------------------
export const getAllQuestionnaires = async (): Promise<IQuestionnaire[]> => {
    try {
        const response = await apiClient.get<IQuestionnaire[]>('/questionnaires');
        return response.data;
    } catch (error) {
        console.error('Error fetching questionnaires:', error);
        throw new Error('Error al obtener los cuestionarios');
    }
};

export const getQuestionnaireById = async (id: number): Promise<IQuestionnaire> => {
    try {
        const response = await apiClient.get<IQuestionnaire>(`/questionnaires/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching questionnaire by id:', error);
        throw new Error('Error al obtener el cuestionario por id');
    }
};

export const getQuestionnairesByCategory = async (categoryId: number): Promise<IQuestionnaire[]> => {
    try {
        const response = await apiClient.get<IQuestionnaire[]>(`/questionnaires/category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching questionnaires by category:', error);
        throw new Error('Error al obtener cuestionarios por categoría');
    }
};

export const createQuestionnaire = async (questionnaire: Partial<IQuestionnaire>): Promise<IQuestionnaire> => {
    try {
        const response = await apiClient.post<IQuestionnaire>('/questionnaires', questionnaire);
        return response.data;
    } catch (error) {
        console.error('Error creating questionnaire:', error);
        throw new Error('Error al crear el cuestionario');
    }
};

export const updateQuestionnaire = async (id: number, questionnaire: Partial<IQuestionnaire>): Promise<IQuestionnaire> => {
    try {
        const response = await apiClient.put<IQuestionnaire>(`/questionnaires/${id}`, questionnaire);
        return response.data;
    } catch (error) {
        console.error('Error updating questionnaire:', error);
        throw new Error('Error al actualizar el cuestionario');
    }
};

export const deleteQuestionnaire = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/questionnaires/${id}`);
    } catch (error) {
        console.error('Error deleting questionnaire:', error);
        throw new Error('Error al eliminar el cuestionario');
    }
};

// ---------------------- WEB ANSWERS ----------------------

export const submitQuestionnaireAnswers = async (
    questionnaireData: QuestionnaireResult,
    userId: number
): Promise<AIRecommendationResult> => {

    const payload: WebAnswersDTO = {
        questionnaireData,
        userId,
    };

    try {
        const response = await apiClient.post<AIRecommendationResult>('/respuestas', payload);
        return response.data;
    } catch (error) {
        console.error('Error submitting questionnaire answers:', error);
        throw new Error('Error al enviar las respuestas del cuestionario');
    }
};

// ---------------------- WEB QUESTIONS ----------------------
export const fetchAllQuestions = async (): Promise<IQuestion[]> => {
    try {
        const response = await apiClient.get<IQuestion[]>('/preguntas');
        return response.data.map(mapQuestionFromDTO);
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw new Error('Error al obtener las preguntas');
    }
};

export const fetchQuestionsByCategory = async (category: string): Promise<IQuestion[]> => {
    try {
        const response = await apiClient.get<IQuestion[]>(`/preguntas/category/${category}`);
        return response.data.map(mapQuestionFromDTO);
    } catch (error) {
        console.error('Error fetching questions by category:', error);
        throw new Error('Error al obtener preguntas por categoría');
    }
};

export const fetchQuestionsByQuestionnaire = async (questionnaireId: number): Promise<IQuestion[]> => {
    try {
        const response = await apiClient.get<any[]>(`/preguntas/questionnaire/${questionnaireId}`);
        return response.data.map(mapQuestionFromDTO);
    } catch (error) {
        console.error('Error fetching questions by questionnaire:', error);
        throw new Error('Error al obtener preguntas por cuestionario');
    }
};

export const createQuestion = async (questionWebModel: any): Promise<IQuestion> => {
    try {
        const response = await apiClient.post<any>('/preguntas', questionWebModel);
        return mapQuestionFromDTO(response.data);
    } catch (error) {
        console.error('Error creating question:', error);
        throw new Error('Error al crear la pregunta');
    }
};

export const updateQuestion = async (id: number, questionWebModel: any): Promise<IQuestion> => {
    try {
        const response = await apiClient.put<any>(`/preguntas/${id}`, questionWebModel);
        return mapQuestionFromDTO(response.data);
    } catch (error) {
        console.error('Error updating question:', error);
        throw new Error('Error al actualizar la pregunta');
    }
};

export const deleteQuestion = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/preguntas/${id}`);
    } catch (error) {
        console.error('Error deleting question:', error);
        throw new Error('Error al eliminar la pregunta');
    }
};
