import { apiClient } from './apiClient';
import type { Question, QuestionnaireResult } from '../types/questionnaire';

interface ApiQuestion {
  id: number;
  title: string;
  type: 'open' | 'single' | 'multiple';
  options?: Array<{
    id: string | number;
    text: string;
  }>;
  keywords?: Array<{
    title: string;
    description: string;
  }>;
}

export const fetchQuestions = async (category?: string, clientType?: string): Promise<Question[]> => {
  try {
    const response = await apiClient.get<ApiQuestion[]>('/preguntas/categoriaycliente', {
      params: {
        category: category,
        clienttype: clientType
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

export const submitQuestionnaireAnswers = async (questionnaireData: QuestionnaireResult): Promise<string> => {
  try {
    const response = await apiClient.post<string>('/respuestas', questionnaireData);
    return response.data;
  } catch (error) {
    console.error('Error submitting questionnaire answers:', error);
    throw new Error('Error al enviar las respuestas del cuestionario');
  }
};