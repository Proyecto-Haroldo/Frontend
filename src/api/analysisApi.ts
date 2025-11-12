import { apiClient } from './apiClient';
import type { QuestionnaireResult } from '../shared/types/questionnaire';
import { IAnalysis } from '../core/models/analysis';
import { IQuestionnaire } from '../core/models/questionnaire';
import { IQuestion, QuestionType } from '../core/models/question';

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

const mapQuestionFromDTO = (question: IQuestion): IQuestion => {
    const options =
        question.options
            ?.filter(option => option != null)
            .map(option => ({
                id: String(option.id),
                text: option.text ?? ''
            })) ?? [];

    const keywords =
        (question.keywords ?? [])
            .map(keyword => ({
                title: keyword?.title ?? '',
                description: keyword?.description ?? ''
            }))
            .filter(keyword => keyword.title);

    return {
        id: question.id,
        title: question.title ?? question.title ?? '',
        questionType: normalizeQuestionType(question.questionType ?? question.questionType),
        options: options.length > 0 ? options : undefined,
        keywords
    };
};

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
export interface AIRecommendationResult {
    resumenUsuario: string;
    colorSemaforo: string; // 'verde' | 'amarillo' | 'rojo'
}

export const submitQuestionnaireAnswers = async (questionnaireData: QuestionnaireResult): Promise<AIRecommendationResult> => {
    try {
        const response = await apiClient.post<AIRecommendationResult>('/respuestas', questionnaireData);
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

export const createQuestion = async (questionWebModel: IQuestion): Promise<IQuestion> => {
    try {
        const response = await apiClient.post<IQuestion>('/preguntas', questionWebModel);
        return response.data;
    } catch (error) {
        console.error('Error creating question:', error);
        throw new Error('Error al crear la pregunta');
    }
};

export const updateQuestion = async (id: number, questionWebModel: IQuestion): Promise<IQuestion> => {
    try {
        const response = await apiClient.put<IQuestion>(`/preguntas/${id}`, questionWebModel);
        return response.data;
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
