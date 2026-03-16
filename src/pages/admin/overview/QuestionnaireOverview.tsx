import { useEffect, useState } from 'react';
import {
  X,
  Loader2,
  Search,
  Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  fetchQuestionsByQuestionnaire,
  getQuestionnaireById
} from '../../../api/analysisApi';
import { IQuestion } from '../../../core/models/question';
import { IQuestionnaire } from '../../../core/models/questionnaire';

function QuestionnaireOverview({ questionnaireId }: { questionnaireId?: number }) {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<IQuestion[]>([]);
  const [viewingQuestion, setViewingQuestion] = useState<IQuestion | null>(null);
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleView = (question: IQuestion) => {
    setViewingQuestion(question);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Visor de Preguntas
              {questionnaire && (
                <div className="flex mt-2 gap-2 capitalize text-base text-md font-normal text-base-content/70">
                  {questionnaire.title || "Sin definir"}
                  <div className={`badge font-semibold text-sm badge-md transition-all duration-300 badge-primary`}>
                    #{questionnaire.id}
                  </div>
                </div>
              )}
            </h1>
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

      {/* Questions Table */}
      {!viewingQuestion && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-3 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 flex-wrap">
              <h2 className="card-title text-lg flex-shrink-0">
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
                <div className="hidden lg:block">
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
                              <span className="badge badge-outline border-0 bg-base-content/30 text-xs badge-sm">
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
                                  className="btn btn-info btn-xs gap-1"
                                  title='Ver'
                                  onClick={() => handleView(question)}
                                >
                                  <Eye className="h-3 w-3" />
                                  <p className="whitespace-nowrap">Ver</p>
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
                              <span className="badge badge-outline border-0 bg-base-content/30 text-xs badge-sm">
                                {question.questionType === 'open' && 'Abierta'}
                                {question.questionType === 'single' && 'Única'}
                                {question.questionType === 'multiple' && 'Múltiple'}
                              </span>
                              {question.options && question.options.length > 0 && (
                                <span className="text-xs text-base-content/50">
                                  #{question.id} · {question.options.length} opciones
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
                            className="btn btn-info btn-xs gap-1"
                            onClick={() => handleView(question)}
                            title='Ver'
                          >
                            <Eye className="h-3 w-3" />
                            <p className="whitespace-nowrap">Ver</p>
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

      {/* View Question Modal */}
      {viewingQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-sm border border-base-200"
        >
          <div className="card-body p-3 md:p-6">
            <h2 className="card-title text-lg sm:text-xl">
              Ver Pregunta - #{viewingQuestion.id}
            </h2>

            <div className="space-y-4">

              {/* Question */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Pregunta</span>
                </label>

                <div className="textarea textarea-bordered text-start w-full bg-base-200 text-base-content/80 overflow-y-auto mt-2 bg-primary/10 border-primary/50">                  {viewingQuestion.question}
                </div>
              </div>

              {/* Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tipo de Pregunta</span>
                </label>

                <div className="input input-bordered w-full flex items-center bg-base-200">
                  {viewingQuestion.questionType === 'open' && 'Abierta'}
                  {viewingQuestion.questionType === 'single' && 'Opción Única'}
                  {viewingQuestion.questionType === 'multiple' && 'Opción Múltiple'}
                </div>
              </div>

              {/* Options */}
              {(viewingQuestion.questionType === 'single' ||
                viewingQuestion.questionType === 'multiple') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Opciones</span>
                    </label>

                    <div className="space-y-2">
                      {viewingQuestion.options?.map((option, index) => (
                        <span
                          key={option.id || index}
                          title={viewingQuestion.question}
                          className="input w-full whitespace-nowrap input-bordered flex items-center bg-base-200 overflow-x-auto"
                        >
                          {option.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  onClick={() => setViewingQuestion(null)}
                  className="btn btn-primary"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default QuestionnaireOverview;