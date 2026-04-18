import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import {
    createQuestionnaire,
    getAllCategories, createQuestion
} from '../../../../api/questionnairesApi';
import { IQuestionnaire, ICategory } from '../../../../core/models/questionnaire';
import { IQuestion, QuestionType } from '../../../../core/models/question';
import { useAuth } from '../../../context/AuthContext';

interface ModalQuestionnaireProps {
    isOpen: boolean;
    onClose: () => void;
    questionnaire?: IQuestionnaire | null;
    onQuestionnaireSaved?: (questionnaire: IQuestionnaire) => void;
}

// Temporary ID for locally-pending questions (not yet saved to API)
const TEMP_ID_PREFIX = -Date.now();
let tempIdCounter = TEMP_ID_PREFIX;
const nextTempId = () => --tempIdCounter;

const ModalQuestionnaire: React.FC<ModalQuestionnaireProps> = ({
    isOpen, onClose, questionnaire, onQuestionnaireSaved,
}) => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
    const [isCreating, setIsCreating] = useState(!questionnaire);
    const [formData, setFormData] = useState<Partial<IQuestionnaire>>({
        title: '', categoryName: '', categoryId: 0,
    });
    const { userId, role } = useAuth();
    const isAdmin = role === 1;
    const canManage = isAdmin;

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch {
            setError('Error al cargar las categorías');
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        fetchCategories();
        setError(null);
        setQuestions([]);

        if (questionnaire) {
            setFormData(questionnaire);
            setIsCreating(false);
        } else {
            setFormData({ title: '', categoryName: '', categoryId: 0 });
            setIsCreating(true);
        }

    }, [isOpen, questionnaire]);

    const handleSave = async () => {
        if (!canManage) return;

        if (!formData.title?.trim()) {
            setError('El título es requerido');
            return;
        }

        if (!formData.categoryId) {
            setError('Selecciona una categoría');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const questionnaireData = {
                ...formData,
                creatorId: userId || 0,
                creatorName: '',
            };

            const savedQuestionnaire = await createQuestionnaire(questionnaireData);

            // SOLO si está creando
            if (isCreating) {
                if (questions.length === 0) {
                    setError('Debes agregar al menos una pregunta');
                    return;
                }

                await Promise.all(
                    questions.map(q =>
                        createQuestion({
                            question: q.question,
                            questionType: q.questionType,
                            categoryName: q.categoryName,
                            categoryId: q.categoryId,
                            questionnaireId: savedQuestionnaire.id,
                            options: q.options || [],
                        })
                    )
                );
            }

            onQuestionnaireSaved?.(savedQuestionnaire);
            onClose();

        } catch {
            setError('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateQuestion = () => {
        if (!formData.categoryId) { setError('Debe seleccionar una categoría antes de agregar preguntas'); return; }
        setIsCreatingQuestion(true);
        setEditingQuestion({
            id: 0,
            question: '',
            questionType: 'OPEN',
            options: [],
            keywords: [],
            categoryName: categories.find(c => c.id === formData.categoryId)?.name || '',
            categoryId: formData.categoryId,
            questionnaireId: 0,
        });
        setShowQuestionModal(true);
    };

    const handleEditQuestion = (question: IQuestion) => {
        setIsCreatingQuestion(false);
        setEditingQuestion({ ...question });
        setShowQuestionModal(true);
    };

    const handleDeleteQuestion = (questionId: number) => {
        if (!confirm('¿Eliminar esta pregunta?')) return;

        setQuestions(prev => prev.filter(q => q.id !== questionId));
    };

    const handleSaveQuestion = () => {
        if (!editingQuestion || !formData.categoryId) return;

        if (!editingQuestion.question.trim()) {
            setError('La pregunta es requerida');
            return;
        }

        if (
            (editingQuestion.questionType === 'SINGLE' || editingQuestion.questionType === 'MULTIPLE') &&
            (!editingQuestion.options || editingQuestion.options.length < 2)
        ) {
            setError('Debe tener al menos 2 opciones');
            return;
        }

        if (isCreatingQuestion) {
            const newQuestion: IQuestion = {
                ...editingQuestion,
                id: nextTempId(),
                categoryName: categories.find(c => c.id === formData.categoryId)?.name || '',
                categoryId: formData.categoryId,
                questionnaireId: 0,
            };

            setQuestions(prev => [...prev, newQuestion]);
        } else {
            setQuestions(prev =>
                prev.map(q => q.id === editingQuestion.id ? editingQuestion : q)
            );
        }

        setShowQuestionModal(false);
        setEditingQuestion(null);
        setIsCreatingQuestion(false);
    };

    const handleAddOption = () => {
        if (!editingQuestion) return;
        setEditingQuestion({ ...editingQuestion, options: [...(editingQuestion.options || []), { id: Date.now(), text: '' }] });
    };

    const handleRemoveOption = (index: number) => {
        if (!editingQuestion) return;
        const newOptions = [...(editingQuestion.options || [])];
        newOptions.splice(index, 1);
        setEditingQuestion({ ...editingQuestion, options: newOptions });
    };

    const handleOptionChange = (index: number, text: string) => {
        if (!editingQuestion) return;
        const newOptions = [...(editingQuestion.options || [])];
        newOptions[index] = { ...newOptions[index], text };
        setEditingQuestion({ ...editingQuestion, options: newOptions });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 m-0">
            <div className="bg-base-200 rounded-lg p-4 pr-3 md:p-6 md:pr-5 max-w-3xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {isCreating ? 'Nuevo Cuestionario' : 'Editar Cuestionario'}
                    </h2>
                    <button title='close' onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="overflow-y-auto overflow-x-hidden pr-1 flex-1">
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>✕</button>
                        </div>
                    )}

                    <div className="space-y-3 mb-6 card bg-base-100 p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            Detalles
                        </h3>
                        <div className="form-control space-y-1">
                            <label htmlFor='title' className="label"><span className="label-text text-md">Título del Cuestionario</span></label>
                            <input
                                type="text" title='title' className="input input-bordered w-full"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ingrese el título del cuestionario"
                            />
                        </div>
                        <div className="form-control space-y-1 mb-2">
                            <label htmlFor='category' className="label"><span className="label-text text-md">Categoría</span></label>
                            <div className="dropdown w-full">
                                <button
                                    tabIndex={0}
                                    type="button"
                                    className="select select-bordered w-full flex items-center"
                                >
                                    <span>
                                        {formData.categoryName || "Seleccione una categoría"}
                                    </span>
                                </button>

                                <ul className="dropdown-content z-[1] menu p-2 bg-base-300 mt-2 rounded-box w-full max-h-60 overflow-y-auto shadow-lg">
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    categoryId: 0,
                                                    categoryName: ""
                                                }))
                                            }
                                        >
                                            Seleccione una categoría
                                        </button>
                                    </li>

                                    {categories.map((c) => (
                                        <li key={c.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        categoryId: c.id,
                                                        categoryName: c.name,
                                                    }))
                                                }
                                            >
                                                {c.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    {isCreating && canManage && (
                        <div className="mb-6 card bg-base-100 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex justify-start items-center gap-2">
                                    <h3 className="text-lg font-semibold">
                                        Preguntas ({questions.length})
                                    </h3>
                                    {questions.length === 0 && (
                                        <span className="badge font-semibold badge-error text-xs p-2">* Debe agregar al menos una pregunta</span>
                                    )}
                                </div>
                                <button
                                    onClick={handleCreateQuestion}
                                    className="btn btn-primary btn-sm gap-2"
                                    disabled={!formData.categoryId}
                                >
                                    <Plus className="h-4 w-4" /> Agregar Pregunta
                                </button>
                            </div>

                            {questions.length === 0 ? (
                                <div className="text-center text-sm py-8 text-base-content/50 bg-base-200 rounded-xl">
                                    No hay preguntas agregadas...
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {questions.map((question) => (
                                        <div key={question.id} className="card bg-base-200 border border-base-300">
                                            <div className="card-body p-3">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="badge badge-outline font-semibold border-0 bg-base-content/30 text-xs badge-sm">
                                                                {question.questionType === 'OPEN' && 'Abierta'}
                                                                {question.questionType === 'SINGLE' && 'Única'}
                                                                {question.questionType === 'MULTIPLE' && 'Múltiple'}
                                                            </span>
                                                            <span className="text-xs text-base-content/50">
                                                                Nueva
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{question.question}</p>
                                                        {question.options && question.options.length > 0 && (
                                                            <div className="mt-2 text-xs text-base-content/60">
                                                                {question.options.length} opciones
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleEditQuestion(question)} className="btn btn-warning btn-xs gap-1" title="Editar">
                                                            <Edit className="h-3 w-3" />
                                                        </button>
                                                        <button onClick={() => handleDeleteQuestion(question.id)} className="btn btn-error btn-xs gap-1" title="Eliminar">
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn btn-ghost" disabled={saving}>Cancelar</button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary gap-2"
                                disabled={saving || (isCreating && questions.length === 0)}
                            >
                                {saving ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</>
                                ) : (
                                    <><Save className="h-4 w-4" />{isCreating ? 'Crear Cuestionario' : 'Guardar Cambios'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Question Modal */}
                {showQuestionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
                        <div className="bg-base-100 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    {isCreatingQuestion ? 'Nueva Pregunta' : 'Editar Pregunta'}
                                </h3>
                                <button
                                    onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); setIsCreatingQuestion(false); }}
                                    className="btn btn-ghost btn-sm btn-circle" title='close'
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {editingQuestion && (
                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label htmlFor='question' className="label"><span className="label-text">Pregunta</span></label>
                                        <textarea
                                            className="textarea textarea-bordered w-full"
                                            value={editingQuestion.question}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                                            placeholder="Escriba la pregunta aquí..."
                                            title='question'
                                            name='question'
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label htmlFor='question-type' className="label"><span className="label-text">Tipo de Pregunta</span></label>
                                        <div className="dropdown w-full">
                                            <button
                                                tabIndex={0}
                                                type="button"
                                                className="select select-bordered w-full flex items-center"
                                            >
                                                <span>
                                                    {editingQuestion.questionType === "OPEN"
                                                        ? "Abierta"
                                                        : editingQuestion.questionType === "SINGLE"
                                                            ? "Opción Única"
                                                            : "Opción Múltiple"}
                                                </span>
                                            </button>

                                            <ul className="dropdown-content z-[1] menu p-2 bg-base-300 mt-2 rounded-box w-full shadow-lg">
                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingQuestion(prev => {
                                                                if (!prev) return prev;

                                                                return {
                                                                    ...prev,
                                                                    questionType: "OPEN" as QuestionType,
                                                                    options: prev.options || [],
                                                                };
                                                            })
                                                        }
                                                    >
                                                        Abierta
                                                    </button>
                                                </li>

                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingQuestion(prev => {
                                                                if (!prev) return prev;

                                                                return {
                                                                    ...prev,
                                                                    questionType: "SINGLE" as QuestionType,
                                                                    options: prev.options || [],
                                                                };
                                                            })
                                                        }
                                                    >
                                                        Opción Única
                                                    </button>
                                                </li>

                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingQuestion(prev => {
                                                                if (!prev) return prev;

                                                                return {
                                                                    ...prev,
                                                                    questionType: "MULTIPLE" as QuestionType,
                                                                    options: prev.options || [],
                                                                };
                                                            })
                                                        }
                                                    >
                                                        Opción Múltiple
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {(editingQuestion.questionType === 'SINGLE' || editingQuestion.questionType === 'MULTIPLE') && (
                                        <div className="form-control">
                                            <label htmlFor='options' className="label"><span className="label-text">Opciones</span></label>
                                            <div className="space-y-2">
                                                {editingQuestion.options?.map((option, index) => (
                                                    <div key={option.id || index} className="flex gap-2">
                                                        <input
                                                            type="text" className="input input-bordered flex-1"
                                                            value={option.text}
                                                            title='options'
                                                            name='options'
                                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                                            placeholder={`Opción ${index + 1}`}
                                                        />
                                                        <button
                                                            type="button" title='close' onClick={() => handleRemoveOption(index)}
                                                            className="btn btn-ghost btn-sm"
                                                            disabled={editingQuestion.options?.length === 2}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={handleAddOption} className="btn btn-outline btn-sm w-full">
                                                    <Plus className="h-4 w-4" /> Agregar Opción
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); setIsCreatingQuestion(false); }}
                                            className="btn btn-ghost"
                                        >
                                            Cancelar
                                        </button>
                                        <button onClick={handleSaveQuestion} className="btn btn-primary gap-2">
                                            <Save className="h-4 w-4" /> Guardar Pregunta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalQuestionnaire;