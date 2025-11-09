import { apiClient } from './apiClient';
import type { Question, QuestionnaireResult } from '../shared/types/questionnaire';
import { QuestionDTO } from '../core/dto/QuestionDTO';
import { Analysis } from '../core/models/AnalysisModel';
import { Questionnaire } from '../core/models/QuestionnaireModel';

// ---------------------- ANALYSIS ----------------------
export const getAllAnalysis = async (): Promise<Analysis[]> => {
    try {
        const response = await apiClient.get<Analysis[]>('/analysis/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching all analysis:', error);
        throw new Error('Failed to fetch all analysis');
    }
};

export const getPendingAnalysis = async (): Promise<Analysis[]> => {
    try {
        const response = await apiClient.get<Analysis[]>('/analysis/pending');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending analysis:', error);
        throw new Error('Failed to fetch pending analysis');
    }
};

export const getCheckedAnalysis = async (): Promise<Analysis[]> => {
    try {
        const response = await apiClient.get<Analysis[]>('/analysis/proofread');
        return response.data;
    } catch (error) {
        console.error('Error fetching checked analysis:', error);
        throw new Error('Failed to fetch checked analysis');
    }
};

export const getUserAnalysis = async (userId: number): Promise<Analysis[]> => {
    try {
        const response = await apiClient.get<Analysis[]>(`/analysis/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user analysis:', error);
        throw new Error('Error al obtener los análisis del usuario');
    }
};

export const getUserAnalysisByCategory = async (userId: number, category: string): Promise<Analysis[]> => {
    try {
        const response = await apiClient.get<Analysis[]>(`/analysis/user/${userId}/category/${category}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user analysis by category:', error);
        throw new Error('Error al obtener los análisis del usuario por categoría');
    }
};

export const getAdviserAnalysis = async (adviserId: number): Promise<Analysis[]> => {
    try {
        const response = await apiClient.get<Analysis[]>(`/analysis/adviser/${adviserId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching adviser analysis:', error);
        throw new Error('Error al obtener los análisis del asesor');
    }
};

export const updateAnalysis = async (id: number, analysisDTO: Partial<Analysis>): Promise<Analysis> => {
    try {
        const response = await apiClient.put<Analysis>(`/analysis/${id}`, analysisDTO);
        return response.data;
    } catch (error) {
        console.error('Error updating analysis:', error);
        throw new Error('Error al actualizar el análisis');
    }
};

export const setCheckedAnalysis = async (id: number): Promise<Analysis> => {
    try {
        const response = await apiClient.put<Analysis>(`/analysis/setChecked/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error setting analysis as checked:', error);
        throw new Error('Error al marcar el análisis como revisado');
    }
};

export const createAnalysis = async (analysisDTO: Partial<Analysis>): Promise<Analysis> => {
    try {
        const response = await apiClient.post<Analysis>('/analysis', analysisDTO);
        return response.data;
    } catch (error) {
        console.error('Error creating analysis:', error);
        throw new Error('Error al crear el análisis');
    }
};

// ---------------------- QUESTIONNAIRE ----------------------
export const getAllQuestionnaires = async (): Promise<Questionnaire[]> => {
    try {
        const response = await apiClient.get<Questionnaire[]>('/questionnaires');
        return response.data;
    } catch (error) {
        console.error('Error fetching questionnaires:', error);
        throw new Error('Error al obtener los cuestionarios');
    }
};

export const getQuestionnaireById = async (id: number): Promise<Questionnaire> => {
    try {
        const response = await apiClient.get<Questionnaire>(`/questionnaires/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching questionnaire by id:', error);
        throw new Error('Error al obtener el cuestionario por id');
    }
};

export const getQuestionnairesByCategory = async (categoryId: number): Promise<Questionnaire[]> => {
    try {
        const response = await apiClient.get<Questionnaire[]>(`/questionnaires/category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching questionnaires by category:', error);
        throw new Error('Error al obtener cuestionarios por categoría');
    }
};

export const createQuestionnaire = async (questionnaire: Partial<Questionnaire>): Promise<Questionnaire> => {
    try {
        const response = await apiClient.post<Questionnaire>('/questionnaires', questionnaire);
        return response.data;
    } catch (error) {
        console.error('Error creating questionnaire:', error);
        throw new Error('Error al crear el cuestionario');
    }
};

export const updateQuestionnaire = async (id: number, questionnaire: Partial<Questionnaire>): Promise<Questionnaire> => {
    try {
        const response = await apiClient.put<Questionnaire>(`/questionnaires/${id}`, questionnaire);
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
export const fetchAllQuestions = async (): Promise<Question[]> => {
    try {
        const response = await apiClient.get<QuestionDTO[]>('/preguntas');
        return response.data.map(q => ({
            id: q.id,
            title: q.title,
            type: q.type,
            options: q.options?.map(opt => ({ id: String(opt.id), text: opt.text })),
            keywords: q.keywords || []
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw new Error('Error al obtener las preguntas');
    }
};

export const fetchQuestionsByCategory = async (category: string): Promise<Question[]> => {
    try {
        const response = await apiClient.get<QuestionDTO[]>(`/preguntas/categoria/${category}`);
        return response.data.map(q => ({
            id: q.id,
            title: q.title,
            type: q.type,
            options: q.options?.map(opt => ({ id: String(opt.id), text: opt.text })),
            keywords: q.keywords || []
        }));
    } catch (error) {
        console.error('Error fetching questions by category:', error);
        throw new Error('Error al obtener preguntas por categoría');
    }
};

export const createQuestion = async (questionWebModel: QuestionDTO): Promise<QuestionDTO> => {
    try {
        const response = await apiClient.post<QuestionDTO>('/preguntas', questionWebModel);
        return response.data;
    } catch (error) {
        console.error('Error creating question:', error);
        throw new Error('Error al crear la pregunta');
    }
};

export const updateQuestion = async (id: number, questionWebModel: QuestionDTO): Promise<QuestionDTO> => {
    try {
        const response = await apiClient.put<QuestionDTO>(`/preguntas/${id}`, questionWebModel);
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
