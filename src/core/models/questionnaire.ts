export interface IQuestionnaire {
    id: number;
    title?: string;
    categoryName: string;
    creatorName: string;
    creatorId: number;
    categoryId: number;
}

export interface ICategoryDTO {
    categoryid: number; 
    title: string;
    description: string;
    decimalvalue: number;
    questionnaires: any[];
}

export interface ICategory {
    id: number;
    name: string;
    description: string;
}

// API → Frontend
export const mapCategoryFromDTO = (apiCategory: ICategoryDTO): ICategory => {
    return {
        id: apiCategory.categoryid,    
        name: apiCategory.title,
        description: apiCategory.description
    };
};

// Frontend → API
export const mapCategoryToDTO = (category: ICategory): Partial<ICategoryDTO> => ({
    title: category.name,
    description: category.description,
});