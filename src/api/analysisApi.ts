import { apiClient } from './apiClient';
import { IAnalysis } from '../core/models/analysis';
import type { QuestionAnswerDTO, GradeRequest } from '../shared/types/analysis';

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

export const getAnalysisAnswers = async (analysisId: number): Promise<QuestionAnswerDTO[]> => {
    try {
        const response = await apiClient.get<QuestionAnswerDTO[]>(`/analysis/${analysisId}/answers`);
        return response.data;
    } catch (error) {
        console.error('Error fetching analysis answers:', error);
        throw new Error('Error al obtener las respuestas del cuestionario');
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

export const setAnalysisGrade = async (analysisId: number, request: GradeRequest): Promise<IAnalysis> => {
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