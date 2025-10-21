import { apiClient } from './apiClient';

export interface Questionnaire {
  id: number;
  categoryName: string;
  clientName: string;
  timeWhenSolved: string;
  state: string;
  recomendacionUsuario: string;
  colorSemaforo: string;
  analisisAsesor: string;
  conteo: number;
}

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
