import axios from 'axios';
import type { Question } from '../types/questionnaire';

const API_URL = import.meta.env.VITE_API_URL;

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
    const response = await axios.get<ApiQuestion[]>(`${API_URL}/preguntas/categoriaycliente`, {
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