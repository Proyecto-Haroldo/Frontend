import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import {
    createQuestionnaire, updateQuestionnaire, deleteQuestionnaire,
    getAllCategories, createQuestion, fetchQuestionsByQuestionnaire, deleteQuestion, updateQuestion,
} from '../../../../api/questionnairesApi';
import { IQuestionnaire, ICategory } from '../../../../core/models/questionnaire';
import { IQuestion, QuestionType } from '../../../../core/models/question';
import { useAuth } from '../../../context/AuthContext';

interface QuestionnaireModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionnaire?: IQuestionnaire | null;
    onQuestionnaireSaved?: (questionnaire: IQuestionnaire) => void;
}

// Temporary ID for locally-pending questions (not yet saved to API)
const TEMP_ID_PREFIX = -Date.now();
let tempIdCounter = TEMP_ID_PREFIX;
const nextTempId = () => --tempIdCounter;

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({
    isOpen, onClose, questionnaire, onQuestionnaireSaved,
}) => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    // Track which question IDs are pending (not yet persisted)
    const [pendingQuestionIds, setPendingQuestionIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
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

    const fetchQuestions = useCallback(async () => {
        if (!formData.id) { setQuestions([]); setLoadingQuestions(false); return; }
        try {
            setLoadingQuestions(true);
            setQuestions([]);
            const data = await fetchQuestionsByQuestionnaire(formData.id);
            setQuestions(data);
        } catch {
            setQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    }, [formData.id]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (questionnaire) {
                setFormData(questionnaire);
                setIsCreating(false);
            } else {
                setFormData({ title: '', categoryName: '', categoryId: 0 });
                setIsCreating(true);
            }
            setQuestions([]);
            setPendingQuestionIds(new Set());
            setError(null);
        } else {
            setQuestions([]);
            setPendingQuestionIds(new Set());
            setError(null);
            setEditingQuestion(null);
            setIsCreatingQuestion(false);
            setShowQuestionModal(false);
        }
    }, [isOpen, questionnaire]);

    useEffect(() => {
        if (formData.id && isOpen) fetchQuestions();
    }, [formData.id, isOpen, fetchQuestions]);

    const handleSave = async () => {
        if (!canManage) return;
        if (!formData.title?.trim()) { setError('El título del cuestionario es requerido'); return; }
        if (!formData.categoryId || formData.categoryId === 0) { setError('Debe seleccionar una categoría'); return; }
        if (isCreating && questions.length === 0) { setError('Debe agregar al menos una pregunta para crear el cuestionario'); return; }

        try {
            setSaving(true);
            setError(null);

            const questionnaireData = { ...formData, creatorId: userId || 0, creatorName: '' };
            let savedQuestionnaire: IQuestionnaire;

            if (isCreating) {
                // 1. Create the questionnaire first
                savedQuestionnaire = await createQuestionnaire(questionnaireData);

                // 2. Persist all locally-pending questions with the real questionnaire ID
                const pendingQuestions = questions.filter(q => pendingQuestionIds.has(q.id));
                await Promise.all(
                    pendingQuestions.map(q =>
                        createQuestion({
                            question: q.question,
                            questionType: q.questionType,
                            categoryName: categories.find(c => c.id === formData.categoryId)?.name || '',
                            categoryId: formData.categoryId,
                            questionnaireId: savedQuestionnaire.id,
                            options: (q.options || []).map(opt => ({ id: opt.id, text: opt.text })),
                        })
                    )
                );
            } else {
                savedQuestionnaire = await updateQuestionnaire(formData.id!, questionnaireData);
            }

            onQuestionnaireSaved?.(savedQuestionnaire);
            onClose();
        } catch {
            setError('Error al guardar el cuestionario');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!canManage || !formData.id) return;
        if (!confirm('¿Está seguro de que desea eliminar este cuestionario? Esta acción también eliminará todas las preguntas asociadas.')) return;
        try {
            await deleteQuestionnaire(formData.id);
            onQuestionnaireSaved?.(null as any);
            onClose();
        } catch {
            setError('Error al eliminar el cuestionario');
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
            questionnaireId: formData.id || 0,
        });
        setShowQuestionModal(true);
    };

    const handleEditQuestion = (question: IQuestion) => {
        setIsCreatingQuestion(false);
        setEditingQuestion({ ...question });
        setShowQuestionModal(true);
    };

    const handleDeleteQuestion = async (questionId: number) => {
        if (!confirm('¿Está seguro de que desea eliminar esta pregunta?')) return;

        // If it's a pending (local-only) question, just remove it from state
        if (pendingQuestionIds.has(questionId)) {
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            setPendingQuestionIds(prev => { const s = new Set(prev); s.delete(questionId); return s; });
            return;
        }

        // Otherwise delete from API
        try {
            await deleteQuestion(questionId);
            await fetchQuestions();
        } catch {
            setError('Error al eliminar la pregunta');
        }
    };

    const handleSaveQuestion = async () => {
        if (!editingQuestion || !formData.categoryId) return;
        if (!editingQuestion.question.trim()) { setError('La pregunta es requerida'); return; }
        if (
            (editingQuestion.questionType === 'SINGLE' || editingQuestion.questionType === 'MULTIPLE') &&
            (!editingQuestion.options || editingQuestion.options.length < 2)
        ) { setError('Las preguntas de opción múltiple deben tener al menos 2 opciones'); return; }

        try {
            setError(null);

            if (isCreating) {
                //Store locally, don't call API yet
                if (isCreatingQuestion) {
                    const tempId = nextTempId();
                    const localQuestion: IQuestion = {
                        ...editingQuestion,
                        id: tempId,
                        categoryName: categories.find(c => c.id === formData.categoryId)?.name || '',
                        categoryId: formData.categoryId,
                        questionnaireId: 0,
                    };
                    setQuestions(prev => [...prev, localQuestion]);
                    setPendingQuestionIds(prev => new Set(prev).add(tempId));
                } else {
                    // Editing an existing local (pending) question
                    setQuestions(prev =>
                        prev.map(q => q.id === editingQuestion.id ? { ...editingQuestion } : q)
                    );
                }
            } else {
                //EXISTING questionnaire: persist to API immediately
                const questionData = {
                    question: editingQuestion.question,
                    questionType: editingQuestion.questionType,
                    categoryName: categories.find(c => c.id === formData.categoryId)?.name || '',
                    categoryId: formData.categoryId,
                    questionnaireId: formData.id!,
                    options: (editingQuestion.options || []).map(opt => ({ id: opt.id, text: opt.text })),
                };
                if (isCreatingQuestion) {
                    await createQuestion(questionData);
                } else {
                    await updateQuestion(editingQuestion.id, questionData);
                }
                await fetchQuestions();
            }

            setShowQuestionModal(false);
            setEditingQuestion(null);
            setIsCreatingQuestion(false);
        } catch {
            setError('Error al guardar la pregunta');
        }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg p-4 md:p-6 max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {isCreating ? 'Nuevo Cuestionario' : 'Editar Cuestionario'}
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                        <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Título del Cuestionario</span></label>
                        <input
                            type="text" className="input input-bordered w-full"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ingrese el título del cuestionario"
                        />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Categoría</span></label>
                        <select
                            className="select select-bordered w-full"
                            value={formData.categoryId || ''}
                            onChange={(e) => {
                                const selectedCategoryId = Number(e.target.value) || 0;
                                const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                                setFormData({
                                    ...formData,
                                    categoryId: selectedCategoryId,
                                    categoryName: selectedCategory?.name || '',
                                });
                            }}
                        >
                            <option value="">Seleccione una categoría</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            Preguntas ({questions.length})
                            {isCreating && questions.length === 0 && (
                                <span className="text-error text-sm ml-2">* Debe agregar al menos una pregunta</span>
                            )}
                        </h3>
                        <button
                            onClick={handleCreateQuestion}
                            className="btn btn-primary btn-sm gap-2"
                            disabled={!formData.categoryId}
                        >
                            <Plus className="h-4 w-4" /> Agregar Pregunta
                        </button>
                    </div>

                    {loadingQuestions ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
                            <p className="text-sm text-base-content/60">Cargando preguntas...</p>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-8 text-base-content/50 border border-dashed border-base-300 rounded-lg">
                            No hay preguntas agregadas
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {questions.map((question) => (
                                <div key={question.id} className="card bg-base-200 border border-base-300">
                                    <div className="card-body p-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="badge badge-outline border-0 bg-base-content/30 text-xs badge-sm">
                                                        {question.questionType === 'OPEN' && 'Abierta'}
                                                        {question.questionType === 'SINGLE' && 'Única'}
                                                        {question.questionType === 'MULTIPLE' && 'Múltiple'}
                                                    </span>
                                                    {pendingQuestionIds.has(question.id) ? (
                                                        <span className="text-xs text-warning italic">sin guardar</span>
                                                    ) : (
                                                        <span className="text-xs text-base-content/50">#{question.id}</span>
                                                    )}
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

                <div className="flex justify-between">
                    <div>
                        {!isCreating && canManage && (
                            <button onClick={handleDelete} className="btn btn-error gap-2" disabled={saving}>
                                <Trash2 className="h-4 w-4" /> Eliminar Cuestionario
                            </button>
                        )}
                    </div>
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
                    <div className="bg-base-100 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {isCreatingQuestion ? 'Nueva Pregunta' : 'Editar Pregunta'}
                            </h3>
                            <button
                                onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); setIsCreatingQuestion(false); }}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {editingQuestion && (
                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Pregunta</span></label>
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        value={editingQuestion.question}
                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                                        placeholder="Escriba la pregunta aquí..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Tipo de Pregunta</span></label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={editingQuestion.questionType}
                                        onChange={(e) => setEditingQuestion({
                                            ...editingQuestion,
                                            questionType: e.target.value as QuestionType,
                                            options: editingQuestion.options || [],
                                        })}
                                    >
                                        <option value="OPEN">Abierta</option>
                                        <option value="SINGLE">Opción Única</option>
                                        <option value="MULTIPLE">Opción Múltiple</option>
                                    </select>
                                </div>

                                {(editingQuestion.questionType === 'SINGLE' || editingQuestion.questionType === 'MULTIPLE') && (
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Opciones</span></label>
                                        <div className="space-y-2">
                                            {editingQuestion.options?.map((option, index) => (
                                                <div key={option.id || index} className="flex gap-2">
                                                    <input
                                                        type="text" className="input input-bordered flex-1"
                                                        value={option.text}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                        placeholder={`Opción ${index + 1}`}
                                                    />
                                                    <button
                                                        type="button" onClick={() => handleRemoveOption(index)}
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
    );
};

export default QuestionnaireModal;