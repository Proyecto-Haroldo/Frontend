import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IQuestionnaire } from "../../../../core/models/questionnaire";

interface TableQuestionnairesProps {
    questionnaires: IQuestionnaire[];
    role: number | null;
    onEditQuestionnaire?: (questionnaire: IQuestionnaire) => void;
    onDeleteQuestionnaire?: (questionnaire: IQuestionnaire) => void;
}

const TableQuestionnaires: React.FC<TableQuestionnairesProps> = ({
    questionnaires,
    role,
    onEditQuestionnaire,
    onDeleteQuestionnaire
}) => {
    const navigate = useNavigate();

    const isAdmin = role === 1;

    const handleViewDetails = (questionnaire: IQuestionnaire) => {
        if (role === 3) {
            navigate(`/a/questionnaires/${questionnaire.id}`);
        } else if (role === 1) {
            navigate(`/m/questionnaires/${questionnaire.id}`);
        }
    };

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-3 md:p-6">
                <h2 className="card-title mb-2 lg:mb-4 text-lg">Cuestionarios ({questionnaires.length}) </h2>

                {questionnaires.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Título</th>
                                        <th>Categoría</th>
                                        <th>Creador</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="[&>tr:hover>td]:bg-base-200/70 [&>tr:hover>td:first-child]:rounded-l-lg [&>tr:hover>td:last-child]:rounded-r-lg">
                                    {questionnaires.map((q) => (
                                        <tr key={q.id}>
                                            <td>{q.id}</td>
                                            <td className="font-semibold">{q.title}</td>
                                            <td>{q.categoryName}</td>
                                            <td>{q.creatorName}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-info btn-xs gap-1"
                                                        onClick={() => handleViewDetails(q)}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        <p className="whitespace-nowrap">Ver</p>
                                                    </button>

                                                    {isAdmin && onEditQuestionnaire && (
                                                        <button
                                                            className="btn btn-warning btn-xs gap-1"
                                                            onClick={() => onEditQuestionnaire(q)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            <p className="whitespace-nowrap">Editar</p>
                                                        </button>
                                                    )}

                                                    {isAdmin && onDeleteQuestionnaire && (
                                                        <button
                                                            className="btn btn-error btn-xs gap-1"
                                                            onClick={() => onDeleteQuestionnaire(q)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            <p className="whitespace-nowrap">Eliminar</p>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-3">
                            {questionnaires.map((q) => (
                                <div key={q.id} className="card bg-base-200 p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                            <span className="text-xs text-base-content/50">
                                                #{q.id}
                                            </span>
                                            <h1 className="text-sm font-bold capitalize">
                                                {q.title || "Sin determinar"}
                                            </h1>
                                            <p className="inline text-base text-xs font-normal text-base-content/70">
                                                <strong>Categoría: </strong>{q.categoryName}
                                            </p>
                                            <div className="capitalize text-base text-xs font-normal text-base-content/70">
                                                <strong>Creador: </strong>{q.creatorName}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                className="btn btn-info btn-xs gap-1"
                                                onClick={() => handleViewDetails(q)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Ver
                                            </button>

                                            {isAdmin && onEditQuestionnaire && (
                                                <button
                                                    className="btn btn-warning btn-xs gap-1"
                                                    onClick={() => onEditQuestionnaire(q)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    Editar
                                                </button>
                                            )}
                                        </div>
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
    );
};

export default TableQuestionnaires;
