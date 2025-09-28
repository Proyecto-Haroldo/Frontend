export interface Diagnostic {
    id: string;
    conteo: number;
    timestamp: string;
    categoria: string;
    recomendacionUsuario: string;
    colorSemaforo: 'verde' | 'amarillo' | 'rojo';
    analisisAsesor: string;
}

export type DiagnosticStatus = 'completed' | 'in-progress' | 'pending';

export type ColorSemaforo = Diagnostic['colorSemaforo'];

// Utility functions for diagnostic processing
export const mapColorToStatus = (color: ColorSemaforo): DiagnosticStatus => {
    return color === 'verde' ? 'completed' : 'in-progress';
};

export const mapColorToProgress = (): number => {
    // All diagnostics are 50% complete when finished, regardless of color
    // Color indicates severity level, not completion level
    return 50;
};

export const getRiskLevel = (color: ColorSemaforo): string => {
    if (color === 'verde') return 'Bajo';
    if (color === 'amarillo') return 'Moderado';
    return 'Alto'; // rojo
};

export const getRiskDescription = (color: ColorSemaforo): string => {
    if (color === 'verde') return 'Su situación financiera es estable y saludable.';
    if (color === 'amarillo') return 'Su situación requiere algunas mejoras.';
    return 'Su situación requiere atención inmediata.'; // rojo
};

// Format diagnostic display name with counter
export const formatDiagnosticTitle = (categoria: string, conteo: number): string => {
    const formattedCategory = categoria.charAt(0).toUpperCase() + categoria.slice(1).replace(/-/g, ' ');
    return conteo > 1 ? `${formattedCategory} #${conteo}` : formattedCategory;
};

// Calculate total progress when assessor review is available
export const calculateTotalProgress = (
    hasAssessorReview: boolean = false
): number => {
    const diagnosticProgress = mapColorToProgress();

    if (hasAssessorReview) {
        // When assessor completes review, add the remaining 50%
        return diagnosticProgress + 50;
    }

    return diagnosticProgress;
};