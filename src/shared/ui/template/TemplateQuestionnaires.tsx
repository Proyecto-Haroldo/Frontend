import React, { useMemo, useState } from "react";
import { Filter, Search, Loader2, Plus, Settings } from "lucide-react";
import { motion } from "motion/react";
import { IQuestionnaire } from "../../../core/models/questionnaire";
import { deleteQuestionnaire } from "../../../api/questionnairesApi";
import TableQuestionnaires from "../components/tables/TableQuestionnaires";
import ModalCategory from "../components/modals/ModalCategory";
import ModalQuestionnaire from "../components/modals/ModalQuestionnaire";

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
    const [showModalCategory, setShowModalCategory] = useState(false);
    const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
    const [editQuestionnaire, setEditQuestionnaire] = useState<IQuestionnaire | null>(null);

    const isAdmin = role === 1;
    const canManage = isAdmin;

    // Obtener categorías únicas para el filtro
    const categories = useMemo(() => {
        const unique = [...new Set(questionnaires.map(q => q.categoryName).filter(Boolean))];
        return ["all", ...unique];
    }, [questionnaires]);

    // Filtrar y buscar
    const filteredQuestionnaires = useMemo(() => {
        let filtered = [...questionnaires];

        if (filter !== "all") {
            filtered = filtered.filter((q) => q.categoryName === filter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();

            filtered = filtered.filter((q) =>
                q.creatorName.toLowerCase().includes(term) ||
                q.categoryName.toLowerCase().includes(term) ||
                (q.title && q.title.toLowerCase().includes(term))
            );
        }

        return filtered;
    }, [questionnaires, filter, searchTerm]);

    const handleCreateQuestionnaire = () => {
        if (!canManage) return;
        setEditQuestionnaire(null);
        setShowQuestionnaireModal(true);
    };

    const handleEditQuestionnaire = (questionnaire: IQuestionnaire) => {
        if (!canManage) return;
        setEditQuestionnaire(questionnaire);
        setShowQuestionnaireModal(true);
    };

    const handleDeleteQuestionnaire = async (questionnaire: IQuestionnaire) => {
        if (!canManage || !questionnaire.id) return;

        const confirmDelete = confirm(
            '¿Está seguro de que desea eliminar este cuestionario? Esta acción también eliminará todas las preguntas asociadas.'
        );

        if (!confirmDelete) return;

        try {
            await deleteQuestionnaire(questionnaire.id);
            onQuestionnairesChange?.();
        } catch {
            console.error('Error eliminando cuestionario');
        }
    };

    const handleQuestionnaireSaved = () => {
        setShowQuestionnaireModal(false);
        setEditQuestionnaire(null);
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
                                        <button onClick={() => {
                                            setFilter(cat);
                                            setSearchTerm('');
                                        }}>
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
                                <p className="mt-4">Cargando servicios...</p>
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
            {/* Header Admin for Categories */}
            {canManage && (
                <div className="card bg-base-100/95 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shadow-sm flex-wrap">
                    <div className="w-full p-3 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <h1 className="text-lg sm:text-xl font-semibold">
                                Gestor de Categorías
                                <div className="flex break-words max-w-xl mt-1 gap-2 text-sm font-normal text-base-content/70">
                                    Aquí puedes crear, editar o eliminar categorías para administrar los módulos ofrecidos en la plataforma.
                                </div>
                            </h1>
                            <button
                                onClick={() => setShowModalCategory(true)}
                                className="btn btn-primary shadow-sm btn-sm gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Gestionar Categorías</span>
                                <span className="sm:hidden">Categorías</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                <button
                                    onClick={handleCreateQuestionnaire}
                                    className="btn btn-outline bg-base-content/10 text-base-content/70 shadow-sm btn-sm gap-2 border-base-content/50 hover:text-base-content hover:border-base-content"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Nuevo Cuestionario</span>
                                    <span className="sm:hidden">Cuestionario</span>
                                </button>
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
                onDeleteQuestionnaire={handleDeleteQuestionnaire}
            />

            {/* Modal Category */}
            <ModalCategory
                isOpen={showModalCategory}
                onClose={() => setShowModalCategory(false)}
                onCategoryCreated={handleCategoryCreated}
            />

            {/* Modal Questionnaire */}
            <ModalQuestionnaire
                isOpen={showQuestionnaireModal}
                onClose={() => setShowQuestionnaireModal(false)}
                questionnaire={editQuestionnaire}
                onQuestionnaireSaved={handleQuestionnaireSaved}
            />
        </div>
    );
};

export default TemplateQuestionnaires;
