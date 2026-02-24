"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Clock, CheckCircle, Filter, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IAnalysis } from "../../../../core/models/analysis";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { motion } from "motion/react";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface TableSearchAnalysisProps {
    analysis: IAnalysis[];
    loading: boolean;
    error: string | null;
    role: number | null;
}

const SearchTableSkeleton: React.FC = () => {
    const { base, highlight } = useThemeColors();

    return (
        <SkeletonTheme baseColor={base} highlightColor={highlight}>
            <div className="container mx-auto space-y-4 md:space-y-6">
                {/* Filtros y búsqueda */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-3 md:p-6 space-y-4">
                        <div className="flex flex-col gap-3">
                            <div>
                                <Skeleton height={40} borderRadius={8} />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton width={100} height={32} borderRadius={6} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de análisis */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-3 md:p-6">
                        <Skeleton width={150} height={20} className="mb-4" />

                        {/* Vista escritorio */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        {[...Array(6)].map((_, i) => (
                                            <th key={i}>
                                                <Skeleton width={80} height={16} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j}>
                                                    <Skeleton width={100} height={16} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Vista móvil */}
                        <div className="lg:hidden space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="card bg-base-200 p-4 space-y-3 border border-base-300 rounded-lg"
                                >
                                    <Skeleton width="60%" height={16} />
                                    <Skeleton width="40%" height={14} />
                                    <div className="flex justify-between items-center">
                                        <Skeleton width="30%" height={14} />
                                        <Skeleton width="30%" height={30} borderRadius={6} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SkeletonTheme>
    );
};

const TableSearchAnalysis: React.FC<TableSearchAnalysisProps> = ({
    loading,
    error,
    analysis,
    role,
}) => {
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAnalysis, setFilteredAnalysis] = useState<IAnalysis[]>([]);
    const navigate = useNavigate();

    const filterAnalysis = useCallback(() => {
        let filtered = analysis;

        // Filtro por estado (backend uses "pending" / "checked")
        if (filter === "pending") {
            filtered = filtered.filter((a) => a.status === "pending");
        } else if (filter === "completed") {
            filtered = filtered.filter((a) => a.status === "checked");
        }

        // Filtro por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(
                (q) =>
                    q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.asesorName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAnalysis(filtered);
    }, [analysis, filter, searchTerm]);

    useEffect(() => {
        filterAnalysis();
    }, [filterAnalysis]);

    const getStateBadge = (state: string) => {
        switch (state) {
            case "pending":
                return (
                    <span className="badge badge-warning badge-sm gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span className="hidden sm:inline">Pendiente</span>
                        <span className="sm:hidden">Pend.</span>
                    </span>
                );
            case "checked":
            case "completed":
                return (
                    <span className="badge badge-success badge-sm gap-1 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">Completado</span>
                        <span className="sm:hidden">Comp.</span>
                    </span>
                );
            default:
                return (
                    <span className="badge badge-neutral badge-sm text-xs">
                        Desconocido
                    </span>
                );
        }
    };

    const getColorBadge = (color: string) => {
        switch (color) {
            case "verde":
                return (
                    <span className="badge badge-success badge-sm text-xs">Verde</span>
                );
            case "amarillo":
                return (
                    <span className="badge badge-warning badge-sm text-xs">Amarillo</span>
                );
            case "rojo":
                return <span className="badge badge-error badge-sm text-xs">Rojo</span>;
            default:
                return (
                    <span className="badge badge-neutral badge-sm text-xs">
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

    if (loading) return <SearchTableSkeleton />;

    if (error)
        return (
            <div className="container mx-auto p-3">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-error shadow-lg"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>{error}</span>
                </motion.div>
            </div>
        );

    return (
        <div className="container mx-auto space-y-4 md:space-y-6">
            {/* Filtros y búsqueda */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50 z-10" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente, asesor o categoría..."
                                className="input input-bordered w-full pl-10 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="dropdown dropdown-end">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="btn btn-outline btn-sm gap-2 text-base-content/50"
                                >
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {filter === "all"
                                            ? "Todos"
                                            : filter === "pending"
                                                ? "Pendientes"
                                                : "Completados"}
                                    </span>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                                >
                                    <li>
                                        <button onClick={() => setFilter("all")}>Todos</button>
                                    </li>
                                    <li>
                                        <button onClick={() => setFilter("pending")}>
                                            Pendientes
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => setFilter("completed")}>
                                            Completados
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla principal */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <h2 className="card-title mb-4 text-lg">Análisis realizados</h2>

                    {filteredAnalysis.length > 0 ? (
                        <>
                            {/* Desktop */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Asesor</th>
                                            <th>Categoría</th>
                                            <th>Estado</th>
                                            <th>Riesgo</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAnalysis.map((a) => (
                                            <tr key={a.analysisId}>
                                                <td>{a.clientName}</td>
                                                <td>{a.asesorName || 'Sin Asignar'}</td>
                                                <td>{a.categoria}</td>
                                                <td>{getStateBadge(a.status)}</td>
                                                <td>{getColorBadge(a.colorSemaforo)}</td>
                                                <td>
                                                    {new Date(a.timeWhenSolved).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary btn-xs gap-1"
                                                        onClick={() => handleViewDetails(a)}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        Ver detalles
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile */}
                            <div className="lg:hidden space-y-3">
                                {filteredAnalysis.map((a) => (
                                    <div key={a.analysisId} className="card bg-base-200 p-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm truncate">
                                                        {a.clientName}
                                                    </h3>
                                                    <span className="badge badge-outline badge-sm text-xs mt-1">
                                                        {a.categoria}
                                                    </span>
                                                </div>
                                                <div className="ml-2 flex-shrink-0">
                                                    {getStateBadge(a.status)}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-1 min-w-0">
                                                    {getColorBadge(a.colorSemaforo)}
                                                    <span className="text-xs text-base-content/70 whitespace-nowrap">
                                                        {new Date(a.timeWhenSolved).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-xs gap-1 flex-shrink-0"
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
        </div>
    );
};

export default TableSearchAnalysis;
