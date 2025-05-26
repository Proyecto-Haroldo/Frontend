import axios from 'axios';
import type { Question } from '../types/questionnaire';

const API_BASE_URL = 'http://localhost:8080/api';

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

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await axios.get<ApiQuestion[]>(`${API_BASE_URL}/preguntas`);
    
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

export const fetchQuestionsByCategory = async (category: string): Promise<Question[]> => {
  try {
    const response = await axios.get<ApiQuestion[]>(`${API_BASE_URL}/preguntas/categoria/${category}`);
    
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