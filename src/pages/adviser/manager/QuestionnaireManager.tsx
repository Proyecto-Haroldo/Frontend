import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Search
} from 'lucide-react';
import {
  fetchQuestionsByQuestionnaire,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionnaireById
} from '../../../api/analysisApi';
import { IQuestion, QuestionType } from '../../../core/models/question';
import { IQuestionnaire } from '../../../core/models/questionnaire';

function QuestionnaireManager({ questionnaireId }: { questionnaireId?: number }) {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<IQuestion[]>([]);
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<IQuestionnaire | null>(null);

  // Fetch questionnaire
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!questionnaireId) return;

      try {
        const data = await getQuestionnaireById(questionnaireId);
        setQuestionnaire(data);
      } catch (err) {
        console.error('Error fetching questionnaire:', err);
        setError('Error al cargar información del cuestionario');
      }
    };
    fetchQuestionnaire();
  }, [questionnaireId]);

  // Fetch questions when questionnaire ID is available
  useEffect(() => {
    if (questionnaireId) {
      fetchQuestions();
    }
  }, [questionnaireId]);

  const fetchQuestions = async () => {
    if (!questionnaireId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchQuestionsByQuestionnaire(questionnaireId);
      // Sort by ID ascending
      const sortedData = [...data].sort((a, b) => a.id - b.id);
      setQuestions(sortedData);
      setFilteredQuestions(sortedData);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  };

  // Filter questions by question text and maintain ID sort
  useEffect(() => {
    if (!searchTitle.trim()) {
      const sorted = [...questions].sort((a, b) => a.id - b.id);
      setFilteredQuestions(sorted);
      return;
    }

    const searchLower = searchTitle.toLowerCase().trim();
    const filtered = questions
      .filter(q => q.question.toLowerCase().includes(searchLower))
      .sort((a, b) => a.id - b.id);
    setFilteredQuestions(filtered);
  }, [searchTitle, questions]);

  const handleCreate = () => {
    if (!questionnaire) {
      setError('No se encontró información del cuestionario');
      return;
    }

    setIsCreating(true);
    setEditingQuestion({
      id: 0,
      question: '',
      questionType: 'open',
      options: [],
      keywords: []
    });
  };

  const handleEdit = (question: IQuestion) => {
    setEditingQuestion({ ...question });
    setIsCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta pregunta?')) {
      return;
    }

    try {
      await deleteQuestion(id);
      await fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Error al eliminar la pregunta');
    }
  };

  const handleSave = async () => {
    if (!editingQuestion || !questionnaire) {
      return;
    }

    // Validation
    if (!editingQuestion.question.trim()) {
      setError('La pregunta es requerida');
      return;
    }

    if ((editingQuestion.questionType === 'single' || editingQuestion.questionType === 'multiple')
      && (!editingQuestion.options || editingQuestion.options.length < 2)) {
      setError('Las preguntas de opción múltiple deben tener al menos 2 opciones');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Map to backend format
      const questionData: Omit<IQuestion, "id" | "keywords"> = {
        question: editingQuestion.question,
        questionType: editingQuestion.questionType,
        categoryName: questionnaire.categoryName,
        options: editingQuestion.options?.map((opt) => ({
          id: opt.id,
          text: opt.text
        })) || []
      };

      if (isCreating) {
        await createQuestion(questionData);
      } else {
        await updateQuestion(editingQuestion.id, questionData);
      }

      setEditingQuestion(null);
      setIsCreating(false);
      await fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Error al guardar la pregunta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingQuestion(null);
    setIsCreating(false);
    setError(null);
  };

  const handleAddOption = () => {
    if (!editingQuestion) return;

    const newOptions = [...(editingQuestion.options || [])];
    newOptions.push({
      id: Date.now(),
      text: ''
    });
    setEditingQuestion({ ...editingQuestion, options: newOptions });
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

  if (loading && !questions.length) {
    return (
      <div className="container mx-auto space-y-6 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="card w-full bg-base-100 shadow-sm border border-base-200">
            <div className="card-body items-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="mt-4">Cargando preguntas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!questionnaireId) {
    return (
      <div className="container mx-auto space-y-6 overflow-hidden">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="card w-full max-w-2xl bg-base-100 shadow-sm border border-base-200">
            <div className="card-body items-center text-center">
              <p className="mb-4">ID de cuestionario no proporcionado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">
              Gestión de Preguntas
              {questionnaire && (
                <span className="block capitalize sm:inline text-base sm:text-lg font-normal text-base-content/70 sm:ml-2">
                  <span className="hidden sm:inline">- </span>{questionnaire.categoryName}
                </span>
              )}
            </h1>
            {!editingQuestion && (
              <button
                onClick={handleCreate}
                className="btn btn-primary btn-sm gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Pregunta</span>
                <span className="sm:hidden">Nueva</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Edit/Create Form */}
      {editingQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-sm border border-base-200"
        >
          <div className="card-body p-3 md:p-6">
            <h2 className="card-title text-lg sm:text-xl">
              {isCreating ? 'Nueva Pregunta' : 'Editar Pregunta'}
            </h2>

            <div className="space-y-4">
              {/* Question Text */}
              <div className="form-control">
                <label className="label" htmlFor='question'>
                  <span className="label-text">Pregunta</span>
                </label>
                <input
                  type="text"
                  title='question'
                  className="input input-bordered w-full"
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  placeholder="Escriba la pregunta aquí..."
                />
              </div>

              {/* Question Type */}
              <div className="form-control">
                <label className="label" htmlFor='question-type'>
                  <span className="label-text">Tipo de Pregunta</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  title='question-type'
                  value={editingQuestion.questionType}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      questionType: e.target.value as QuestionType,
                      options: editingQuestion.options || []
                    })
                  }
                >
                  <option value="open">Abierta</option>
                  <option value="single">Opción Única</option>
                  <option value="multiple">Opción Múltiple</option>
                </select>
              </div>

              {/* Options for single/multiple */}
              {(editingQuestion.questionType === 'single' ||
                editingQuestion.questionType === 'multiple') && (
                  <div className="form-control">
                    <label className="label" htmlFor='options'>
                      <span className="label-text">Opciones</span>
                    </label>
                    <div className="space-y-2">
                      {editingQuestion.options?.map((option, index) => (
                        <div key={option.id || index} className="flex gap-2">
                          <input
                            type="text"
                            title='options'
                            className="input input-bordered flex-1"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Opción ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="btn btn-ghost btn-sm flex-shrink-0"
                            disabled={editingQuestion.options?.length === 2}
                            title="Eliminar opción"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="btn btn-outline btn-sm w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar Opción
                      </button>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost w-full sm:w-auto"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary gap-2 w-full sm:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Questions Table */}
      {!editingQuestion && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-3 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 flex-wrap">
              <h2 className="card-title text-lg sm:text-xl flex-shrink-0">
                Preguntas ({filteredQuestions.length}{searchTitle && ` de ${questions.length}`})
              </h2>

              {/* Search/Filter by Title */}
              <div className="form-control w-full sm:w-auto sm:min-w-[16rem]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50 z-10" />
                  <input
                    type="text"
                    className="input input-bordered input-sm sm:input-md pl-10 w-full"
                    placeholder="Buscar pregunta..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                  {searchTitle && (
                    <button
                      onClick={() => setSearchTitle('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs"
                      title="Limpiar búsqueda"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-base-content/50">
                No hay preguntas en este cuestionario
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-base-content/50">
                No se encontraron preguntas que contengan "{searchTitle}"
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block -mx-3 md:-mx-6">
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th className="w-16">ID</th>
                          <th className="min-w-[200px]">Título</th>
                          <th className="w-28">Tipo</th>
                          <th className="w-24">Opciones</th>
                          <th className="w-32">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuestions.map((question) => (
                          <tr key={question.id}>
                            <td>{question.id}</td>
                            <td className="max-w-md">
                              <div className="truncate" title={question.question}>
                                {question.question}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-outline badge-sm">
                                {question.questionType === 'open' && 'Abierta'}
                                {question.questionType === 'single' && 'Única'}
                                {question.questionType === 'multiple' && 'Múltiple'}
                              </span>
                            </td>
                            <td className="text-center">
                              {question.options?.length || 0}
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(question)}
                                  className="btn btn-sm btn-ghost"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(question.id)}
                                  className="btn btn-sm btn-ghost text-error"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-2">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="card bg-base-200 border border-base-300 shadow-sm">
                      <div className="card-body p-3 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs text-base-content/50 font-mono">ID: {question.id}</span>
                              <span className="badge badge-outline badge-xs">
                                {question.questionType === 'open' && 'Abierta'}
                                {question.questionType === 'single' && 'Única'}
                                {question.questionType === 'multiple' && 'Múltiple'}
                              </span>
                              {question.options && question.options.length > 0 && (
                                <span className="text-xs text-base-content/50">
                                  {question.options.length} opciones
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-sm break-words line-clamp-2" title={question.question}>
                              {question.question}
                            </h3>
                          </div>
                        </div>
                        <div className="flex gap-1 justify-end pt-1">
                          <button
                            onClick={() => handleEdit(question)}
                            className="btn btn-xs btn-ghost gap-1"
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="btn btn-xs btn-ghost text-error gap-1"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionnaireManager;