export interface IQuestionnaire {
    id: number;
    title?: string;
    categoryName: string;
    creatorName: string;
    creatorId: number;
    categoryId: number;
}

export interface ICategory {
    id: number
    name: string
    description: string
}