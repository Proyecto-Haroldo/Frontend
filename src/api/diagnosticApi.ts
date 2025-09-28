import { apiClient } from './apiClient';
import { Diagnostic } from '../types/diagnostics';

export type { Diagnostic } from '../types/diagnostics';

export const fetchUserDiagnostics = async (): Promise<Diagnostic[]> => {
    try {
        const response = await apiClient.get<Diagnostic[]>('/analisis/usuario');
        return response.data;
    } catch (error) {
        console.error('Error fetching user diagnostics:', error);
        throw new Error('Error al obtener los diagnósticos del usuario');
    }
};