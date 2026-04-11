"use client";
import React from "react";
import { Clock, CheckCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IAnalysis } from "../../../../core/models/analysis";

interface TableAnalysisProps {
    analysis: IAnalysis[];
    role: number | null;
}

const TableAnalysis: React.FC<TableAnalysisProps> = ({
    analysis,
    role,
}) => {
    const navigate = useNavigate();

    const getStatusBadge = (state: string) => {
        switch (state?.toUpperCase()) {
            case "PENDING":
                return (
                    <span className="badge badge-secondary font-semibold p-2 badge-sm gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span className="hidden sm:inline">Pendiente</span>
                        <span className="sm:hidden">Pend.</span>
                    </span>
                );
            case "CHECKED":
            case "COMPLETED":
                return (
                    <span className="badge badge-primary font-semibold p-2 badge-sm gap-1 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">Completado</span>
                        <span className="sm:hidden">Comp.</span>
                    </span>
                );
            default:
                return (
                    <span className="badge badge-neutral font-semibold p-2 badge-sm text-xs">
                        <span className="hidden sm:inline">Desconocido</span>
                        <span className="sm:hidden">Desc.</span>
                    </span>
                );
        }
    };

    const getColorBadge = (color: string) => {
        switch (color) {
            case "verde":
                return (
                    <span className="badge badge-success font-semibold p-2 badge-sm text-xs">Verde</span>
                );
            case "amarillo":
                return (
                    <span className="badge badge-warning font-semibold p-2 badge-sm text-xs">Amarillo</span>
                );
            case "rojo":
                return <span className="badge badge-error font-semibold p-2 badge-sm text-xs">Rojo</span>;
            default:
                return (
                    <span className="badge badge-neutral font-semibold p-2 badge-sm text-xs">
                        Sin clasificar
                    </span>
                );
        }
    };

    const handleViewDetails = (analysis: IAnalysis) => {
        if (role === 3) {
            navigate(`/a/analysis/${analysis.analysisId}`);
        } else if (role === 1) {
            navigate(`/m/analysis/${analysis.analysisId}`);
        }
    };

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-3 md:p-6">
                <h2 className="card-title mb-2 lg:mb-4 text-lg">Análisis</h2>

                {analysis.length > 0 ? (
                    <>
                        {/* Desktop */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Asesor</th>
                                        <th>Cuestionario</th>
                                        <th>Categoría</th>
                                        <th>Estado</th>
                                        <th>Riesgo</th>
                                        <th>Fecha</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="[&>tr:hover>td]:bg-base-200/70 [&>tr:hover>td:first-child]:rounded-l-lg [&>tr:hover>td:last-child]:rounded-r-lg">
                                    {analysis.map((a) => (
                                        <tr key={a.analysisId}>
                                            <td>{a.analysisId}</td>
                                            <td className="font-semibold">{a.clientName}</td>
                                            <td>{a.asesorName || 'Sin Asignar'}</td>
                                            <td>{a.questionnaireTitle}</td>
                                            <td>{a.categoryName}</td>
                                            <td>{getStatusBadge(a.status)}</td>
                                            <td>{getColorBadge(a.colorSemaforo)}</td>
                                            <td>
                                                {new Date(a.timeWhenSolved).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-info btn-xs gap-1"
                                                    onClick={() => handleViewDetails(a)}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    <p className="whitespace-nowrap">Ver</p>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="lg:hidden space-y-3">
                            {analysis.map((a) => (
                                <div key={a.analysisId} className="card bg-base-200 p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-base-content/70 whitespace-nowrap">
                                                    #{a.analysisId} · {new Date(a.timeWhenSolved).toLocaleDateString()}
                                                </span>
                                                <h3 className="text-md truncate font-bold">
                                                    {a.clientName}
                                                </h3>
                                                <h3 className="text-sm capitalize truncate font-normal text-xs">
                                                    <strong>Cuestionario: </strong>{a.questionnaireTitle}
                                                </h3>
                                                <h3 className="text-sm capitalize truncate font-normal text-xs">
                                                    <strong>Categoría: </strong>{a.categoryName}
                                                </h3>
                                                <h3 className="text-sm capitalize truncate font-normal text-xs">
                                                    <strong>Asesor: </strong>{a.asesorName || "Sin Asignar"}
                                                </h3>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {getStatusBadge(a.status)}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex-shrink-0">
                                                {getColorBadge(a.colorSemaforo)}
                                            </div>
                                            <button
                                                className="btn btn-info btn-xs gap-1 flex-shrink-0"
                                                onClick={() => handleViewDetails(a)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-base-content/50">
                        No se encontraron análisis
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableAnalysis;
