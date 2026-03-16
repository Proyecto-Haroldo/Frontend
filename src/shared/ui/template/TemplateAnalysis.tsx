"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Filter, Search, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { IAnalysis } from "../../../core/models/analysis";
import TableAnalysis from "../components/tables/TableAnalysis";

interface TemplateAnalysisProps {
    analysis: IAnalysis[];
    loading: boolean;
    error: string | null;
    role: number | null;
}

const TemplateAnalysis: React.FC<TemplateAnalysisProps> = ({
    loading,
    error,
    analysis,
    role,
}) => {
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAnalysis, setFilteredAnalysis] = useState<IAnalysis[]>([]);

    const filterAnalysis = useCallback(() => {
        let filtered = analysis;

        // Filtro por estado (backend uses "PENDING" / "CHECKED")
        if (filter === "pending") {
            filtered = filtered.filter((a) => a.status?.toUpperCase() === "PENDING");
        } else if (filter === "completed") {
            filtered = filtered.filter((a) => a.status?.toUpperCase() === "CHECKED");
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

    if (loading)
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
                                <div className="dropdown dropdown-start">
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
                                        className="dropdown-content z-[1] menu p-2 shadow-md bg-base-300 mt-2 rounded-box w-52"
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

                <div className="container mx-auto space-y-6 overflow-hidden">
                    <div className="flex items-center justify-center">
                        <div className="card w-full bg-base-100 shadow-sm border border-base-200">
                            <div className="card-body items-center text-center">
                                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                                <p className="mt-4">Cargando análisis...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

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
                            <div className="dropdown dropdown-start">
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
                                    className="dropdown-content z-[1] menu p-2 shadow-md bg-base-300 mt-2 rounded-box w-52"
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

            {/* Tabla análisis */}
            <TableAnalysis
                analysis={filteredAnalysis}
                role={role}
            />
        </div>
    );
};

export default TemplateAnalysis;
