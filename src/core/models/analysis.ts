import { ColorSemaforo } from "../../shared/types/analysis";

export interface IAnalysis {
    analysisId: number;
    asesorName: string;
    clientName: string;
    timeWhenSolved: string;
    timeWhenChecked: string;
    status: string;
    analisisIA: string;
    colorSemaforo: ColorSemaforo;
    resumenIA: string;
    comentarioAsesor: string;
    conteo: number;
    categoryName: string;
    questionnaireTitle: string;
}