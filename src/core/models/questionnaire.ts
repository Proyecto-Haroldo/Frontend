export interface IQuestionnaire {
    id: number;
    title?: string;
    categoryName: string;
    creatorName: string;
    creatorId: number;
    categoryId: number;
}

export type Category = {
    id: number
    name: string
    description: string
}