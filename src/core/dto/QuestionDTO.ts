export interface QuestionDTO {
    id: number;
    title?: string;
    question?: string;
    type?: string;
    questionType?: string;
    options?: Array<{
        id: string | number;
        text?: string;
    }>;
    keywords?: Array<{
        title: string;
        description: string;
    }>;
}