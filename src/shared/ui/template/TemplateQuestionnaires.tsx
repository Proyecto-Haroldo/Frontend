import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Search, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { IQuestionnaire } from "../../../core/models/questionnaire";
import TableQuestionnaires from "../components/tables/TableQuestionnaires";
import CategoryModal from "../components/modals/CategoryModal";
import QuestionnaireModal from "../components/modals/QuestionnaireModal";
import { useAuth } from "../../context/AuthContext";

interface TemplateQuestionnairesProps {
    questionnaires: IQuestionnaire[];
    loading: boolean;
    error: string | null;
    role: number | null;
    onQuestionnairesChange?: () => void;
}

const TemplateQuestionnaires: React.FC<TemplateQuestionnairesProps> = ({
    questionnaires,
    loading,
    error,
    role,
    onQuestionnairesChange,
}) => {
    const [filter, setFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<
        IQuestionnaire[]
    >([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
    const [editingQuestionnaire, setEditingQuestionnaire] = useState<IQuestionnaire | null>(null);
    const { role: userRole } = useAuth();

    const isAdmin = userRole === 1;
    const canManage = isAdmin;

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
                    q.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (q.title && q.title.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredQuestionnaires(filtered);
    }, [questionnaires, filter, searchTerm]);

    useEffect(() => {
        filterQuestionnaires();
    }, [filterQuestionnaires]);

    const handleCreateQuestionnaire = () => {
        if (!canManage) return;
        setEditingQuestionnaire(null);
        setShowQuestionnaireModal(true);
    };

    const handleEditQuestionnaire = (questionnaire: IQuestionnaire) => {
        if (!canManage) return;
        setEditingQuestionnaire(questionnaire);
        setShowQuestionnaireModal(true);
    };

    const handleQuestionnaireSaved = () => {
        setShowQuestionnaireModal(false);
        setEditingQuestionnaire(null);
        onQuestionnairesChange?.();
    };

    const handleCategoryCreated = () => {
        onQuestionnairesChange?.();
    };

    // Errores o carga
    if (loading)
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
                        <div className="dropdown dropdown-start">
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
                                className="dropdown-content z-[1] menu p-2 shadow-md bg-base-300 mt-2 rounded-box w-52"
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

                <div className="container mx-auto space-y-6 overflow-hidden">
                    <div className="flex items-center justify-center">
                        <div className="card w-full bg-base-100 shadow-sm border border-base-200">
                            <div className="card-body items-center text-center">
                                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                                <p className="mt-4">Cargando cuestionarios...</p>
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
                    <span>{error}</span>
                </motion.div>
            </div>
        );

    return (
        <div className="container mx-auto space-y-4 md:space-y-6">
            {/* Buscador y Filtros */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6 space-y-3">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                        <div className="flex-1 w-full">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50 z-10" />
                                <input
                                    type="text"
                                    placeholder="Buscar por creador, categoría o título..."
                                    className="input input-bordered w-full pl-10 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {/* Filter Dropdown */}
                            <div className="dropdown dropdown-start">
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
                                    className="dropdown-content z-[1] menu p-2 shadow-md bg-base-300 mt-2 rounded-box w-52"
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

                            {/* Action Buttons */}
                            {canManage && (
                                <>
                                    <button
                                        onClick={() => setShowCategoryModal(true)}
                                        className="btn btn-outline btn-sm gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Categoría
                                    </button>
                                    <button
                                        onClick={handleCreateQuestionnaire}
                                        className="btn btn-primary btn-sm gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Cuestionario
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Cuestionarios */}
            <TableQuestionnaires
                questionnaires={filteredQuestionnaires}
                role={role}
                onEditQuestionnaire={handleEditQuestionnaire}
            />

            {/* Category Modal */}
            <CategoryModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onCategoryCreated={handleCategoryCreated}
            />

            {/* Questionnaire Modal */}
            <QuestionnaireModal
                isOpen={showQuestionnaireModal}
                onClose={() => setShowQuestionnaireModal(false)}
                questionnaire={editingQuestionnaire}
                onQuestionnaireSaved={handleQuestionnaireSaved}
            />
        </div>
    );
};

export default TemplateQuestionnaires;
