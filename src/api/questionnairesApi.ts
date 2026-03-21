import { apiClient } from "./apiClient";
import { IQuestion, QuestionType } from "../core/models/question";
import { IQuestionnaire } from "../core/models/questionnaire";
import { IRecommendationAI, IWebAnswer } from '../core/models/answers';
import type { IQuestionnaireResult } from '../core/types/questionnaire';

const normalizeQuestionType = (value?: string): QuestionType => {
    switch (value?.toLowerCase()) {
        case 'single':
            return 'SINGLE';
        case 'multiple':
            return 'MULTIPLE';
        case 'open':
            return 'OPEN';
        default:
            return 'OPEN';
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

// ---------------------- QUESTIONNAIRES ----------------------
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

export const submitIQuestionnaireAnswers = async (
    userId: number,
    questionnaireData: IQuestionnaireResult,
): Promise<IRecommendationAI> => {

    const payload: IWebAnswer = {
        userId: userId,
        questionnaireData: questionnaireData
    };

    try {
        const response = await apiClient.post<IRecommendationAI>('/respuestas', payload);
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
