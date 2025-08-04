import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock,
  ArrowLeft,
  Filter
} from 'lucide-react';

type Priority = 'Alta' | 'Media' | 'Baja';

function DiagnosticReview() {
  const [showAnswers, setShowAnswers] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<Priority, boolean>>({
    Alta: true,
    Media: true,
    Baja: true
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diagnosticId = searchParams.get('id');

  // Get AI recommendation from localStorage
  const aiRecommendation = localStorage.getItem('aiRecommendation');
  const questionnaireData = localStorage.getItem('questionnaireData');
  
  // Parse questionnaire data if available
  const parsedQuestionnaireData = questionnaireData ? JSON.parse(questionnaireData) : null;
  
  // This would come from your API/state management in the future
  const diagnostic = {
    id: diagnosticId || 1,
    type: parsedQuestionnaireData?.metadata?.clientType || 'Personal',
    date: parsedQuestionnaireData?.metadata?.timestamp ? new Date(parsedQuestionnaireData.metadata.timestamp).toLocaleDateString('es-ES') : '15 Mar 2024',
    status: 'completed',
    aiAnalysis: {
      summary: aiRecommendation || "Basado en sus respuestas, hemos identificado áreas clave para mejorar su salud financiera...",
      recommendations: [
        {
          title: "Gestión de Presupuesto",
          description: "Su presupuesto actual muestra **oportunidades de optimización** que pueden mejorar significativamente su salud financiera.",
          priority: "Alta" as Priority
        },
        {
          title: "Plan de Ahorro",
          description: "Recomendamos establecer un **fondo de emergencia**...",
          priority: "Media" as Priority
        },
        {
          title: "Inversiones",
          description: "Considerando su perfil de riesgo, sugerimos **diversificar** sus inversiones.",
          priority: "Baja" as Priority
        }
      ],
      riskAssessment: {
        overall: "Moderado",
        details: "Su perfil financiero muestra un nivel moderado de riesgo..."
      }
    }
  };

  const toggleFilter = (priority: Priority) => {
    setActiveFilters(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const filteredRecommendations = diagnostic.aiAnalysis.recommendations.filter(
    rec => activeFilters[rec.priority]
  );

  // In the future, you would fetch the diagnostic data here
  useEffect(() => {
    if (diagnosticId) {
      // Example of future API call:
      // fetchDiagnostic(diagnosticId)
      //   .then(data => setDiagnostic(data))
      //   .catch(error => console.error('Error fetching diagnostic:', error));
      console.log('Fetching diagnostic with ID:', diagnosticId);
    }
  }, [diagnosticId]);

  // If no ID is provided, redirect to diagnostics page
  useEffect(() => {
    if (!diagnosticId) {
      navigate('/diagnostics');
    }
  }, [diagnosticId, navigate]);

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-ghost gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm text-base-content/70">
              Generado el {diagnostic.date}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-6">
              Diagnóstico {diagnostic.type}
            </h1>

            {/* AI Analysis Section */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-base-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Resumen del Análisis</h2>
                <div className="prose dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {diagnostic.aiAnalysis.summary}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recomendaciones</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">Filtrar:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFilter('Alta')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          activeFilters.Alta ? 'bg-error/10' : 'bg-base-200'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-error ${!activeFilters.Alta && 'opacity-50'}`}></div>
                        <span className="text-sm">Alta</span>
                      </button>
                      <button
                        onClick={() => toggleFilter('Media')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          activeFilters.Media ? 'bg-warning/10' : 'bg-base-200'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-warning ${!activeFilters.Media && 'opacity-50'}`}></div>
                        <span className="text-sm">Media</span>
                      </button>
                      <button
                        onClick={() => toggleFilter('Baja')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          activeFilters.Baja ? 'bg-success/10' : 'bg-base-200'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-success ${!activeFilters.Baja && 'opacity-50'}`}></div>
                        <span className="text-sm">Baja</span>
                      </button>
                    </div>
                  </div>
                </div>
                {filteredRecommendations.map((rec, index) => {
                  const priorityColor = {
                    'Alta': 'bg-error/10 border-error',
                    'Media': 'bg-warning/10 border-warning',
                    'Baja': 'bg-success/10 border-success'
                  }[rec.priority];

                  const priorityTextColor = {
                    'Alta': 'text-error',
                    'Media': 'text-warning',
                    'Baja': 'text-success'
                  }[rec.priority];

                  return (
                    <div 
                      key={index}
                      className={`card ${priorityColor} border hover:bg-opacity-20 transition-colors`}
                    >
                      <div className="card-body">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="card-title text-lg">{rec.title}</h3>
                            <div className="mt-2 prose dark:prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                              >
                                {rec.description}
                              </ReactMarkdown>
                            </div>
                          </div>
                          <div className={`badge ${priorityTextColor} border-current ml-4 flex-shrink-0`}>
                            {rec.priority}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Risk Assessment */}
              <div className="bg-base-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Evaluación de Riesgo</h2>
                <div className="flex items-center gap-4">
                  <div className="badge badge-lg badge-primary">
                    {diagnostic.aiAnalysis.riskAssessment.overall}
                  </div>
                  <p className="text-base-content/80">
                    {diagnostic.aiAnalysis.riskAssessment.details}
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Answers Section */}
            <div className="divider"></div>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="btn btn-ghost gap-2 w-full"
            >
              {showAnswers ? (
                <>
                  <ChevronUp className="h-5 w-5" />
                  Ocultar Respuestas
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5" />
                  Ver Respuestas
                </>
              )}
            </button>
            
            {showAnswers && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <p className="text-center text-base-content/70">
                  Esta sección mostrará todas sus respuestas al cuestionario.
                  <br />
                  (Implementación pendiente)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticReview; 