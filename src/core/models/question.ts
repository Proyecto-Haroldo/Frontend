export interface Keyword {
    title: string;
    description: string;
}

export interface IOption {
    id: number;
    text: string;
}

export type QuestionType = 'open' | 'single' | 'multiple';

export interface IQuestion {
    id: number;
    categoryId?: number;
    categoryName?: string;
    question: string;
    questionType: QuestionType;
    questionnaireId?: number;
    options: IOption[];
    keywords: Keyword[];
}