import { JSX } from 'react';
import { categoriesIcons } from '../../../public/assets/Categories';

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
    description: string;
    icon: number;
    decimalvalue?: number;
    questionnaires?: any[];
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
    const categoryFound = categoriesIcons.find(
        (cat) => cat.id === apiCategory.icon
    );

    const defaultIcon = categoriesIcons.find((cat) => cat.id === 0);

    return {
        id: apiCategory.categoryId,
        name: apiCategory.title,
        description: apiCategory.description,
        icon: categoryFound || defaultIcon!
    };
};

// Frontend → API
export const mapCategoryToDTO = (category: ICategory): Partial<ICategoryDTO> => ({
    title: category.name,
    description: category.description,
    icon: category.icon.id,
    categoryId: category.id
});