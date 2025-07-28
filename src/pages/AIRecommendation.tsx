import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { submitQuestionnaireAnswers } from '../api/questionnaireApi';
import type { QuestionnaireResult } from '../types/questionnaire';
import { 
  ArrowLeft, 
  Brain, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const AIRecommendation = () => {
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get prompt from URL params or use default test prompt
  const prompt = searchParams.get('prompt') || `Análisis de cuestionario financiero:

Categoría: finanzas
Tipo de Cliente: persona
Fecha: ${new Date().toISOString()}

Respuestas del cuestionario:
1. ¿Cuál es su principal objetivo financiero?
   Respuesta: Ahorrar para la jubilación

2. ¿Cuánto puede ahorrar mensualmente?
   Respuesta: 500,000 pesos

3. ¿Tiene deudas pendientes?
   Respuesta: Sí, tarjeta de crédito

4. ¿Cuál es su nivel de conocimiento financiero?
   Respuesta: Básico

5. ¿Qué tipo de inversiones le interesan?
   Respuesta: Fondos de pensiones, CDT`;

  useEffect(() => {
    if (prompt) {
      fetchRecommendation();
    }
  }, [prompt]);

  const fetchRecommendation = async () => {
    if (!prompt) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a test questionnaire result for demonstration
      const testQuestionnaireData: QuestionnaireResult = {
        metadata: {
          category: 'finanzas',
          clientType: 'persona',
          timestamp: new Date().toISOString()
        },
        answers: [
          {
            questionId: 1,
            questionTitle: '¿Cuál es su principal objetivo financiero?',
            answer: ['Ahorrar para la jubilación'],
            type: 'single'
          },
          {
            questionId: 2,
            questionTitle: '¿Cuánto puede ahorrar mensualmente?',
            answer: ['500,000 pesos'],
            type: 'open'
          },
          {
            questionId: 3,
            questionTitle: '¿Tiene deudas pendientes?',
            answer: ['Sí, tarjeta de crédito'],
            type: 'open'
          }
        ]
      };
      
      const response = await submitQuestionnaireAnswers(testQuestionnaireData);
      setRecommendation(response);
    } catch (err) {
      setError('Error al obtener la recomendación de IA');
      console.error('Error fetching AI recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4">Generando recomendación de IA...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <div className="alert alert-error mb-6">
              <AlertCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-primary gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-sm text-base-content/70">
              Recomendación de IA
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="card-title text-2xl">
                Análisis y Recomendación de IA
              </h1>
            </div>

            {recommendation ? (
              <div className="space-y-6">
                <div className="bg-base-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Recomendación</h2>
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="whitespace-pre-wrap text-base-content/80 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: recommendation.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm">Análisis completado exitosamente</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                <p className="text-base-content/70">
                  No hay recomendación disponible. 
                  <br />
                  Complete un cuestionario para obtener una recomendación personalizada.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation; 