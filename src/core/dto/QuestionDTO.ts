export interface QuestionDTO {
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