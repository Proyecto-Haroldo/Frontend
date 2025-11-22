import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchQuestionsByCategory, submitQuestionnaireAnswers } from '../../api/analysisApi';
import type { QuestionnaireResult } from '../../shared/types/questionnaire';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Home,
  Loader2,
  FileText
} from 'lucide-react';
import { IQuestion } from '../../core/models/question';
import { useAuth } from '../../shared/context/AuthContext';

const pageVariants = {
  initial: {
    x: 100,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const HighlightedText = ({
  text,
  keywords = [],
  allowedKeywords
}: {
  text: string;
  keywords: { title: string; description: string }[];
  allowedKeywords: Set<string>;
}) => {
  if (!keywords || keywords.length === 0) return <span>{text}</span>;

  // Create a map for quick keyword lookup (case-insensitive)
  const keywordMap = new Map();
  keywords.forEach(keyword => {
    const keyLower = keyword.title.toLowerCase();
    if (allowedKeywords.has(keyLower)) {
      keywordMap.set(keyLower, keyword);
    }
  });

  // Split text into words while preserving spaces and punctuation
  const words = text.split(/(\s+|[.,!?;:()"])/);

  return (
    <span className="inline">
      {words.map((word, index) => {
        // Skip empty strings and whitespace-only strings
        if (!word || /^\s+$/.test(word)) {
          return <span key={index}>{word}</span>;
        }

        // Clean the word for keyword matching (remove punctuation)
        const cleanWord = word.toLowerCase().replace(/[.,!?;:()"]/g, '');
        const keyword = keywordMap.get(cleanWord);

        if (keyword) {
          return (
            <span
              key={index}
              className="tooltip tooltip-info inline-block"
              data-tip={keyword.description}
            >
              <span className="text-primary cursor-help underline decoration-dotted underline-offset-2 inline-block hover:bg-base-300 hover:text-primary transition-all duration-200 rounded-sm px-0.5 -mx-0.5">
                {word}
              </span>
            </span>
          );
        }

        return <span key={index}>{word}</span>;
      })}
    </span>
  );
};

const Questionnaire = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch de preguntas según categoría
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');

    if (category) {
      setIsLoading(true);
      fetchQuestionsByCategory(category)
        .then(fetchedQuestions => {
          setQuestions(fetchedQuestions);
          setIsLoading(false);
        })
        .catch(err => {
          setError('Error al cargar las preguntas');
          setIsLoading(false);
          console.error('Error fetching questions:', err);
        });
    } else {
      navigate('/c/services');
    }
  }, [location, navigate]);

  const currentQuestion = questions[currentQuestionIndex] || {
    id: 0,
    question: '',
    questionType: 'open' as const,
    keywords: []
  };


  // Pre-calculate which keywords should be highlighted to ensure each appears only once
  const keywordAllocation = useMemo(() => {
    const allocation = {
      title: new Set<string>(),
      options: new Map<string, Set<string>>()
    };

    if (!currentQuestion.keywords) return allocation;

    const usedKeywords = new Set<string>();

    // Helper function to find keywords in text
    const findKeywordsInText = (text: string | undefined | null) => {
      if (!text?.trim()) {
        return new Set<string>();
      }
      const foundKeywords = new Set<string>();
      const words = text.split(/(\s+|[.,!?;:()"])/);

      words.forEach(word => {
        if (!word || /^\s+$/.test(word)) return;
        const cleanWord = word.toLowerCase().replace(/[.,!?;:()"]/g, '');

        currentQuestion.keywords?.forEach(keyword => {
          const keywordLower = keyword.title.toLowerCase();
          if (cleanWord === keywordLower && !usedKeywords.has(keywordLower)) {
            foundKeywords.add(keywordLower);
            usedKeywords.add(keywordLower);
          }
        });
      });

      return foundKeywords;
    };

    // First, allocate keywords found in the question
    allocation.title = findKeywordsInText(currentQuestion.question);

    // Then, allocate keywords found in options (excluding those already used in question)
    currentQuestion.options?.forEach(option => {
      allocation.options.set(String(option.id), findKeywordsInText(option.text));
    });

    return allocation;
  }, [currentQuestion]);

  const progress =
    questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion =
    questions.length > 0 ? currentQuestionIndex === questions.length - 1 : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4">Cargando cuestionario...</p>
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
            <button onClick={() => navigate('/c/services')} className="btn btn-primary gap-2">
              <ArrowLeft className="h-5 w-5" />
              Volver a Servicios
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      try {
        setIsSubmitting(true);
        const params = new URLSearchParams(location.search);
        const category = params.get('category');

        if (!category) throw new Error('Información de categoría no encontrada');

        const questionnaireData: QuestionnaireResult = {
          metadata: {
            category,
            clientType: 'N/A',
            timestamp: new Date().toISOString()
          },
          answers: questions.map(question => ({
            questionId: question.id,
            questionTitle: question.question,
            answer: question.questionType === 'open'
              ? answers[question.id] || []
              : (answers[question.id] || []).map(
                id => question.options?.find(opt => String(opt.id) === String(id))?.text || String(id)
              ),
            questionType: question.questionType
          }))
        };

        console.log('Submitting questionnaire data:', questionnaireData);

        if (userId == null) {
          setError('Usuario no autenticado. Por favor inicie sesión.');
          return;
        }

        const aiRecommendation = await submitQuestionnaireAnswers(questionnaireData, userId);

        // Store the full JSON returned by backend: { resumenUsuario, colorSemaforo }
        localStorage.setItem('aiRecommendation', JSON.stringify(aiRecommendation));
        localStorage.setItem('questionnaireData', JSON.stringify(questionnaireData));

        setIsComplete(true);
      } catch (err) {
        setError('Error al procesar las respuestas. Por favor, intente nuevamente.');
        console.error('Error processing answers:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleAnswerChange = (value: string | string[]) => {
    const answerValue = Array.isArray(value) ? value : [value];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerValue
    }));
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.questionType) {
      case 'open':
        return (
          <textarea
            className="textarea textarea-bordered w-full h-32"
            placeholder="Escriba la respuesta aqui..."
            value={answers[currentQuestion.id]?.[0] || ''}
            onChange={e => handleAnswerChange(e.target.value)}
          />
        );

      case 'single':
        return (
          <div className="space-y-1">
            {currentQuestion.options?.map(option => (
              <div key={option.id} className="form-control">
                <label
                  htmlFor={String(option.id)}
                  className="label cursor-pointer justify-start gap-3 p-2 hover:bg-base-200 rounded-lg"
                >
                  <input
                    type="radio"
                    title={currentQuestion.id.toString()}
                    id={String(option.id)}
                    name={currentQuestion.id.toString()}
                    checked={Array.isArray(answers[currentQuestion.id]) && String(answers[currentQuestion.id][0]) === String(option.id)}
                    onChange={() => handleAnswerChange(String(option.id))}
                    className="radio radio-primary"
                  />
                  <span className="label-text text-left">
                    <HighlightedText
                      text={option.text}
                      keywords={currentQuestion.keywords || []}
                      allowedKeywords={keywordAllocation.options.get(String(option.id)) || new Set()}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-1">
            {currentQuestion.options?.map(option => (
              <div key={option.id} className="form-control">
                <label
                  htmlFor={String(option.id)}
                  className="label cursor-pointer justify-start gap-3 p-2 hover:bg-base-200 rounded-lg"
                >
                  <input
                    type="checkbox"
                    id={String(option.id)}
                    checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].map(String).includes(String(option.id))}
                    onChange={(e) => {
                      const currentAnswers = new Set(answers[currentQuestion.id] || []);
                      if (e.target.checked) {
                        currentAnswers.add(String(option.id));
                      } else {
                        currentAnswers.delete(String(option.id));
                      }
                      handleAnswerChange(Array.from(currentAnswers));
                    }}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text text-left">
                    <HighlightedText
                      text={option.text}
                      keywords={currentQuestion.keywords || []}
                      allowedKeywords={keywordAllocation.options.get(String(option.id)) || new Set()}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-6">
          <div className="card-body items-center text-center">
            <div className="mb-6">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
            </div>
            <h2 className="card-title text-2xl mb-4">¡Cuestionario Completado!</h2>
            <p className="mb-6">
              Gracias por completar el cuestionario. Nuestro equipo analizará sus respuestas y se
              pondrá en contacto con usted pronto para proporcionarle un análisis personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/c')} className="btn btn-primary gap-2">
                <Home className="h-5 w-5" />
                Volver al Inicio
              </button>
              <button
                onClick={() => navigate('/c/analysis-review?id=1')}
                className="btn btn-outline gap-2"
              >
                <FileText className="h-5 w-5" />
                Ver análisis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="submitting"
          className="min-h-screen bg-base-200 flex items-center justify-center p-4"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="mb-6">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              </div>
              <h2 className="card-title text-2xl mb-4">Procesando respuestas.</h2>
              <p className="mb-6">
                Estamos analizando sus respuestas y generando su análisis.
              </p>
              <div className="text-sm text-gray-500">Esto puede tomar unos momentos...</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="questionnaire"
        className="min-h-screen bg-base-200 flex items-center justify-center p-4"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Progress Bar */}
            <div className="w-full bg-base-200 rounded-full h-2.5 mb-6">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress Text */}
            <div className="text-sm text-gray-500 mb-2">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </div>

            {/* Question - Question text is rendered first to establish keyword priority */}
            <h2 className="card-title text-2xl mb-6">
              <HighlightedText
                text={currentQuestion.question}
                keywords={currentQuestion.keywords || []}
                allowedKeywords={keywordAllocation.title}
              />
            </h2>

            {/* Question Input - Options are rendered after title so keywords used in title won't be highlighted again */}
            <div className="mb-8">{renderQuestionInput()}</div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="btn btn-ghost gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0}
                className={`btn gap-2 ${isLastQuestion ? 'btn-success' : 'btn-primary'}`}
              >
                {isLastQuestion ? (
                  <>
                    <FileText className="h-5 w-5" />
                    Enviar Respuestas
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Questionnaire;