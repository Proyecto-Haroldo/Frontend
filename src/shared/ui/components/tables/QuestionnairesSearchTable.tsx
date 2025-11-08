import React, { useCallback, useEffect, useState } from 'react';
import { Clock, CheckCircle, Filter, Search, Eye } from 'lucide-react';
import { useThemeColors } from "../../../hooks/useThemeColors";
import { Questionnaire } from '../../../../core/models/QuestionnaireModel';
import { motion } from 'motion/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface QuestionnairesSearchTableProps {
    questionnaires: Questionnaire[];
    loading: boolean;
    error: string | null;
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
                            {/* Search Input */}
                            <div>
                                <Skeleton height={40} borderRadius={8} />
                            </div>
                            {/* Filter Button */}
                            <div className="flex gap-2">
                                <Skeleton width={100} height={32} borderRadius={6} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de Cuestionarios */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-3 md:p-6">
                        <Skeleton width={150} height={20} className="mb-4" />

                        {/* Vista de escritorio */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                        <th><Skeleton width={80} height={16} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td><Skeleton width={120} height={16} /></td>
                                            <td><Skeleton width={100} height={16} /></td>
                                            <td><Skeleton width={90} height={16} /></td>
                                            <td><Skeleton width={80} height={16} /></td>
                                            <td><Skeleton width={100} height={16} /></td>
                                            <td><Skeleton width={60} height={30} borderRadius={6} /></td>
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

const QuestionnairesSearchTable: React.FC<QuestionnairesSearchTableProps> = ({
    loading,
    error,
    questionnaires,
}) => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<Questionnaire[]>([]);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const filterQuestionnaires = useCallback(() => {
        let filtered = questionnaires;

        // Apply state filter
        if (filter === 'pending') {
            filtered = filtered.filter(q => q.state === 'pending');
        } else if (filter === 'completed') {
            filtered = filtered.filter(q => q.state === 'completed');
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(q =>
                q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredQuestionnaires(filtered);
    }, [questionnaires, filter, searchTerm]);

    useEffect(() => {
        filterQuestionnaires();
    }, [filterQuestionnaires]);


    const getStateBadge = (state: string) => {
        switch (state) {
            case 'pending':
                return <span className="badge badge-warning badge-sm gap-1 text-xs"><Clock className="h-3 w-3" /><span className="hidden sm:inline">Pendiente</span><span className="sm:hidden">Pend.</span></span>;
            case 'completed':
                return <span className="badge badge-success badge-sm gap-1 text-xs"><CheckCircle className="h-3 w-3" /><span className="hidden sm:inline">Completado</span><span className="sm:hidden">Comp.</span></span>;
            default:
                return <span className="badge badge-neutral badge-sm text-xs">Desconocido</span>;
        }
    };

    const getColorBadge = (color: string) => {
        switch (color) {
            case 'verde':
                return <span className="badge badge-success badge-sm text-xs">Verde</span>;
            case 'amarillo':
                return <span className="badge badge-warning badge-sm text-xs">Amarillo</span>;
            case 'rojo':
                return <span className="badge badge-error badge-sm text-xs">Rojo</span>;
            default:
                return <span className="badge badge-neutral badge-sm text-xs">Sin clasificar</span>;
        }
    };

    const handleViewDetails = (questionnaire: Questionnaire) => {
        setSelectedQuestionnaire(questionnaire);
        setShowDetailsModal(true);
    };

    const closeModal = () => {
        setShowDetailsModal(false);
        setSelectedQuestionnaire(null);
    };

    if (loading) {
        return (
            <SearchTableSkeleton />
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-3">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-error shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-4 md:space-y-6">
            {/* Filters and Search */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente o categoría..."
                                className="input input-bordered w-full pl-10 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-outline btn-sm gap-2">
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {filter === 'all' ? 'Todos' : filter === 'pending' ? 'Pendientes' : 'Completados'}
                                    </span>
                                    <span className="sm:hidden">
                                        {filter === 'all' ? 'Todos' : filter === 'pending' ? 'Pend.' : 'Comp.'}
                                    </span>
                                </div>
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li><button onClick={() => setFilter('all')}>Todos</button></li>
                                    <li><button onClick={() => setFilter('pending')}>Pendientes</button></li>
                                    <li><button onClick={() => setFilter('completed')}>Completados</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questionnaires Table */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-3 md:p-6">
                    <h2 className="card-title mb-4 text-lg">Cuestionarios</h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th className="hidden md:table-cell">Categoría</th>
                                            <th>Estado</th>
                                            <th className="hidden lg:table-cell">Riesgo</th>
                                            <th className="hidden sm:table-cell">Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQuestionnaires.map((questionnaire) => (
                                            <tr key={questionnaire.id}>
                                                <td>
                                                    <div className="font-medium truncate max-w-32" title={questionnaire.clientName}>
                                                        {questionnaire.clientName}
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell">
                                                    <span className="badge badge-outline badge-sm text-xs max-w-24 truncate" title={questionnaire.categoryName}>
                                                        {questionnaire.categoryName}
                                                    </span>
                                                </td>
                                                <td>{getStateBadge(questionnaire.state)}</td>
                                                <td className="hidden lg:table-cell">{getColorBadge(questionnaire.colorSemaforo)}</td>
                                                <td className="hidden sm:table-cell">
                                                    <div className="text-xs text-base-content/70">
                                                        {new Date(questionnaire.timeWhenSolved).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary btn-xs gap-1 whitespace-nowrap"
                                                        onClick={() => handleViewDetails(questionnaire)}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        <span className="hidden sm:inline">Ver detalles</span>
                                                        <span className="sm:hidden">Ver</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-3">
                                {filteredQuestionnaires.map((questionnaire) => (
                                    <div key={questionnaire.id} className="card bg-base-200 p-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm truncate">{questionnaire.clientName}</h3>
                                                    <span className="badge badge-outline badge-sm text-xs mt-1">
                                                        {questionnaire.categoryName}
                                                    </span>
                                                </div>
                                                <div className="ml-2 flex-shrink-0">
                                                    {getStateBadge(questionnaire.state)}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-1 min-w-0">
                                                    {getColorBadge(questionnaire.colorSemaforo)}
                                                    <span className="text-xs text-base-content/70 whitespace-nowrap">
                                                        {new Date(questionnaire.timeWhenSolved).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-xs gap-1 flex-shrink-0"
                                                    onClick={() => handleViewDetails(questionnaire)}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    Ver
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredQuestionnaires.length === 0 && (
                                <div className="text-center py-8 text-base-content/50">
                                    No se encontraron cuestionarios
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedQuestionnaire && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg md:text-xl font-semibold">Detalles del Cuestionario</h2>
                            <button
                                onClick={closeModal}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">ID</label>
                                    <p className="text-base-content">{selectedQuestionnaire.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content/70">Estado</label>
                                    <p>{getStateBadge(selectedQuestionnaire.state)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content/70">Cliente</label>
                                <p className="text-base-content">{selectedQuestionnaire.clientName}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content/70">Categoría</label>
                                <p className="text-base-content">{selectedQuestionnaire.categoryName}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content/70">Fecha de Resolución</label>
                                <p className="text-sm md:text-base text-base-content">
                                    {new Date(selectedQuestionnaire.timeWhenSolved).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content/70">Nivel de Riesgo</label>
                                <p>{getColorBadge(selectedQuestionnaire.colorSemaforo)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content/70">Recomendación del Usuario</label>
                                <p className="text-sm md:text-base text-base-content bg-base-200 p-3 rounded">
                                    {selectedQuestionnaire.recomendacionUsuario || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content/70">Análisis del Asesor</label>
                                <p className="text-sm md:text-base text-base-content bg-base-200 p-3 rounded">
                                    {selectedQuestionnaire.analisisAsesor || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-base-content/70">Conteo</label>
                                <p className="text-base-content">{selectedQuestionnaire.conteo}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                            <button onClick={closeModal} className="btn btn-outline">
                                Cerrar
                            </button>
                            {selectedQuestionnaire.state === 'pending' && (
                                <button className="btn btn-primary">
                                    Marcar como Completado
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionnairesSearchTable;
