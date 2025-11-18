import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { IQuestionnaire } from "../../../../core/models/questionnaire";
import { motion } from "motion/react";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface TableSearchQuestionnairesProps {
    questionnaires: IQuestionnaire[];
    loading: boolean;
    error: string | null;
    role: number | null;
}

// Skeleton Loader
const SearchTableSkeleton: React.FC = () => {
    const { base, highlight } = useThemeColors();

    return (
        <SkeletonTheme baseColor={base} highlightColor={highlight}>
            <div className="container mx-auto space-y-4 md:space-y-6">
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-3 md:p-6 space-y-4">
                        <Skeleton height={40} borderRadius={8} />
                        <Skeleton width={100} height={32} borderRadius={6} />
                    </div>
                </div>

                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-3 md:p-6">
                        <Skeleton width={150} height={20} className="mb-4" />
                        <table className="table">
                            <thead>
                                <tr>
                                    {[...Array(5)].map((_, i) => (
                                        <th key={i}>
                                            <Skeleton width={80} height={16} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(5)].map((_, j) => (
                                            <td key={j}>
                                                <Skeleton width={100} height={16} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SkeletonTheme>
    );
};

// Main Component
const TableSearchQuestionnaires: React.FC<TableSearchQuestionnairesProps> = ({
    questionnaires,
    loading,
    error,
    role,
}) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<
        IQuestionnaire[]
    >([]);

    // Obtener categorías únicas para el filtro
    const categories = useMemo(() => {
        const unique = Array.from(
            new Set(questionnaires.map((q) => q.categoryName))
        );
        return ["all", ...unique];
    }, [questionnaires]);

    // Filtrar y buscar
    const filterQuestionnaires = useCallback(() => {
        let filtered = [...questionnaires];

        if (filter !== "all") {
            filtered = filtered.filter((q) => q.categoryName === filter);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (q) =>
                    q.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredQuestionnaires(filtered);
    }, [questionnaires, filter, searchTerm]);

    useEffect(() => {
        filterQuestionnaires();
    }, [filterQuestionnaires]);

    const handleViewDetails = (questionnaire: IQuestionnaire) => {
        if (role === 3) {
            navigate(`/a/questionnaires/${questionnaire.id}`);
        } else if (role === 1) {
            navigate(`/m/questionnaires/${questionnaire.id}`);
        }
    };

    // Errores o carga
    if (loading) return <SearchTableSkeleton />;

    if (error)
        return (
            <div className="container mx-auto p-3">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-error shadow-lg"
                >
                    <span>{error}</span>
                </motion.div>
            </div>
        );

    return (
        <div className="container mx-auto space-y-4 md:space-y-6">
            {/* Buscador y Filtros */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6 space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50 z-10" />
                        <input
                            type="text"
                            placeholder="Buscar por creador o categoría..."
                            className="input input-bordered w-full pl-10 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-outline btn-sm gap-2 text-base-content/50"
                        >
                            <Filter className="h-4 w-4" />
                            <span>{filter === "all" ? "Todas las categorías" : filter}</span>
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <button onClick={() => setFilter(cat)}>
                                        {cat === "all" ? "Todas las categorías" : cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tabla de Cuestionarios */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <h2 className="card-title mb-4 text-lg">Cuestionarios</h2>

                    {filteredQuestionnaires.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Categoría</th>
                                            <th>Creador</th>
                                            <th>ID Creador</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQuestionnaires.map((q) => (
                                            <tr key={q.id}>
                                                <td>{q.id}</td>
                                                <td>{q.categoryName}</td>
                                                <td>{q.creatorName}</td>
                                                <td>{q.creatorId}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary btn-xs gap-1"
                                                        onClick={() => handleViewDetails(q)}
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

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-3">
                                {filteredQuestionnaires.map((q) => (
                                    <div key={q.id} className="card bg-base-200 p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-sm">
                                                    {q.creatorName}
                                                </h3>
                                                <p className="text-xs text-base-content/70">
                                                    Categoría: {q.categoryName}
                                                </p>
                                            </div>
                                            <button
                                                className="btn btn-primary btn-xs gap-1"
                                                onClick={() => handleViewDetails(q)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-base-content/50">
                            No se encontraron cuestionarios
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableSearchQuestionnaires;
