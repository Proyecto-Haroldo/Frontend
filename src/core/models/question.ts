export interface Keyword {
    title: string;
    description: string;
}

export interface QuestionOption {
    id: string;
    text: string;
}

export type QuestionType = 'open' | 'single' | 'multiple';

export interface IQuestion {
    id: number;
    title: string;
    questionType: QuestionType;
    options?: QuestionOption[];
    keywords: Keyword[];
}