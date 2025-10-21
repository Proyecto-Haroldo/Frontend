import { apiClient } from './apiClient';
import type { Question, QuestionnaireResult } from '../types/questionnaire';
import { Questionnaire } from '../core/models/QuestionnaireModel';
import { QuestionDTO } from '../core/dto/QuestionDTO';

export const getAllQuestionnaires = async (): Promise<Questionnaire[]> => {
  try {
    const response = await apiClient.get<Questionnaire[]>('/questionnaires/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all questionnaires:', error);
    throw new Error('Failed to fetch questionnaires');
  }
};

export const getPendingQuestionnaires = async (): Promise<Questionnaire[]> => {
  try {
    const response = await apiClient.get<Questionnaire[]>('/questionnaires/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending questionnaires:', error);
    throw new Error('Failed to fetch pending questionnaires');
  }
};

export const updateQuestionnaireStatus = async (id: number, status: string): Promise<void> => {
  try {
    await apiClient.put(`/questionnaires/${id}/status`, { status });
  } catch (error) {
    console.error('Error updating questionnaire status:', error);
    throw new Error('Failed to update questionnaire status');
  }
};

export const getQuestionnaireDetails = async (id: number): Promise<Questionnaire> => {
  try {
    const response = await apiClient.get<Questionnaire>(`/questionnaires/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questionnaire details:', error);
    throw new Error('Failed to fetch questionnaire details');
  }
};

export const fetchQuestions = async (category?: string, _clientType?: string): Promise<Question[]> => {
  try {
    const response = await apiClient.get<QuestionDTO[]>('/preguntas/categoriaycliente', {
      params: {
        category: category,
        // clienttype: clientType // Commented out for future use - we may need client type filtering again
      }
    });
    
    return response.data.map((q): Question => ({
      id: q.id,
      title: q.title,
      type: q.type,
      options: q.options?.map(opt => ({
        id: String(opt.id),
        text: opt.text
      })),
      keywords: q.keywords || []
    }));
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error('Failed to fetch questions');
  }
};

// New function to fetch questions by category only (regardless of client type)
export const fetchQuestionsByCategory = async (category: string): Promise<Question[]> => {
  try {
    const response = await apiClient.get<QuestionDTO[]>(`/preguntas/categoria/${category}`);
    
    return response.data.map((q): Question => ({
      id: q.id,
      title: q.title,
      type: q.type,
      options: q.options?.map(opt => ({
        id: String(opt.id),
        text: opt.text
      })),
      keywords: q.keywords || []
    }));
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    throw new Error('Failed to fetch questions by category');
  }
};

export interface AIRecommendationResult {
  resumenUsuario: string;
  colorSemaforo: string; // 'verde' | 'amarillo' | 'rojo'
}

export const submitQuestionnaireAnswers = async (
  questionnaireData: QuestionnaireResult
): Promise<AIRecommendationResult> => {
  try {
    const response = await apiClient.post<AIRecommendationResult>('/respuestas', questionnaireData);
    return response.data;
  } catch (error) {
    console.error('Error submitting questionnaire answers:', error);
    throw new Error('Error al enviar las respuestas del cuestionario');
  }
};