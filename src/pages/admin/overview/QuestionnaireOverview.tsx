import { useEffect, useState } from 'react';
import {
  X,
  Loader2,
  Search
} from 'lucide-react';
import {
  fetchQuestionsByQuestionnaire,
  getQuestionnaireById
} from '../../../api/analysisApi';
import { IQuestion } from '../../../core/models/question';
import { IQuestionnaire } from '../../../core/models/questionnaire';

function QuestionnaireOverview({ questionnaireId }: { questionnaireId?: number }) {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<IQuestion[]>([]);
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
      {(
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

export default QuestionnaireOverview;