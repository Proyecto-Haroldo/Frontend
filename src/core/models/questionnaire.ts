import { JSX } from 'react';
import { categories } from '../../../public/assets/Categories';

export interface IQuestionnaire {
    id: number;
    title?: string;
    categoryName: string;
    creatorName: string;
    creatorId: number;
    categoryId: number;
}

export interface ICategoryDTO {
    categoryId: number;
    title: string;
    icon: number;
    description: string;
    decimalvalue: number;
    questionnaires: any[];
}

export interface ICategory {
    id: number;
    name: string;
    description: string;
    icon: ICategoryIcon;
}

export interface ICategoryIcon {
    id: number;
    svg: JSX.Element | null;
}

// API → Frontend
export const mapCategoryFromDTO = (apiCategory: ICategoryDTO): ICategory => {
    const categoryFound = categories.find(
        (cat) => cat.id === apiCategory.icon
    );

    if (!categoryFound) {
        throw new Error(`Category with id ${apiCategory.icon} not found`);
    }

    return {
        id: apiCategory.categoryId,
        name: apiCategory.title,
        description: apiCategory.description,
        icon: categoryFound.icon
    };
};

// Frontend → API
export const mapCategoryToDTO = (category: ICategory): Partial<ICategoryDTO> => ({
    title: category.name,
    description: category.description,
    icon: category.icon.id,
    categoryId: category.id
});