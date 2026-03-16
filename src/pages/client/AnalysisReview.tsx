import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import {
  ColorSemaforo,
  getRiskLevel,
  getRiskDescription,
  formatAnalysisTitle
} from '../../shared/types/analysis';
import { Stoplight } from '../../shared/ui/components/stoplight/Stoplight';
import { IAnalysis } from '../../core/models/analysis';
import { getAnalysisAnswers } from '../../api/analysisApi';
import type { QuestionAnswerDTO } from '../../shared/types/analysis';
import type { IQuestionnaireAnswer } from '../../shared/types/questionnaire';

function AnalysisReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAnswers, setShowAnswers] = useState(false);
  const [apiAnswers, setApiAnswers] = useState<QuestionAnswerDTO[] | null>(null);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Get analysis data from navigation state
  const analysis = location.state?.analysis as IAnalysis | undefined;

  // Fallback: get analysis ID from URL params for direct navigation
  const analysisIdFromUrl = searchParams.get('id');

  // For backward compatibility with localStorage (questionnaire completion flow)
  const aiRecommendationFromLS = localStorage.getItem('aiRecommendation');
  const questionnaireDataFromLS = localStorage.getItem('questionnaireData');
  const parsedQuestionnaireFromLS = (() => {
    if (!questionnaireDataFromLS) return null;
    try {
      const parsed = JSON.parse(questionnaireDataFromLS) as { answers?: IQuestionnaireAnswer[] } | null;
      return parsed?.answers ? parsed : null;
    } catch {
      return null;
    }
  })();

  let analysisData: {
    id: string;
    conteo: number;
    timestamp: string;
    categoria: string;
    recomendacionUsuario: string;
    colorSemaforo: ColorSemaforo
  } | null = null;

  if (analysis) {
    // Primary: Use data from navigation state
    // Normalize colorSemaforo to ensure it's a valid ColorSemaforo value
    const rawColor = String(analysis.colorSemaforo || 'amarillo').toLowerCase();
    let colorSemaforo: ColorSemaforo = 'amarillo';
    if (rawColor === 'rojo' || rawColor === 'red') colorSemaforo = 'rojo';
    else if (rawColor === 'amarillo' || rawColor === 'yellow') colorSemaforo = 'amarillo';
    else if (rawColor === 'verde' || rawColor === 'green') colorSemaforo = 'verde';

    analysisData = {
      id: analysis.analysisId.toString(),
      conteo: analysis.conteo,
      timestamp: analysis.timeWhenSolved || new Date().toISOString(),
      categoria: analysis.categoria,
      recomendacionUsuario: analysis.analisisIA,
      colorSemaforo: colorSemaforo
    };
  } else if (analysisIdFromUrl && aiRecommendationFromLS) {
    // Fallback for direct URL navigation with localStorage data
    let resumenUsuario = 'Basado en sus respuestas, hemos identificado áreas clave para mejorar su salud financiera...';
    let colorSemaforo: ColorSemaforo = 'amarillo';

    try {
      const parsed = JSON.parse(aiRecommendationFromLS);
      if (parsed && typeof parsed === 'object' && 'resumenUsuario' in parsed && 'colorSemaforo' in parsed) {
        const resumenField = (parsed as any).resumenUsuario;
        resumenUsuario = typeof resumenField === 'string' ? resumenField : JSON.stringify(resumenField);
        const rawColor = String((parsed as any).colorSemaforo || colorSemaforo).toLowerCase();
        if (rawColor === 'rojo' || rawColor === 'red') colorSemaforo = 'rojo';
        else if (rawColor === 'amarillo' || rawColor === 'yellow') colorSemaforo = 'amarillo';
        else if (rawColor === 'verde' || rawColor === 'green') colorSemaforo = 'verde';
      } else {
        resumenUsuario = aiRecommendationFromLS;
      }
    } catch {
      resumenUsuario = aiRecommendationFromLS;
    }

    const parsedIQuestionnaireData = questionnaireDataFromLS ? JSON.parse(questionnaireDataFromLS) : null;

    analysisData = {
      id: analysisIdFromUrl,
      conteo: 1, // Default to 1 for legacy localStorage data
      timestamp: parsedIQuestionnaireData?.metadata?.timestamp || new Date().toISOString(),
      categoria: parsedIQuestionnaireData?.metadata?.category || 'General',
      recomendacionUsuario: resumenUsuario,
      colorSemaforo: colorSemaforo
    };
  }

  // Status configuration
  const statusConfig: Record<ColorSemaforo, {
    icon: typeof CheckCircle;
    title: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = {
    verde: {
      icon: CheckCircle,
      title: 'Situación Saludable',
      color: 'text-success',
      bgColor: 'bg-success/5',
      borderColor: 'border-success/20'
    },
    amarillo: {
      icon: AlertTriangle,
      title: 'Requiere Atención',
      color: 'text-warning',
      bgColor: 'bg-warning/5',
      borderColor: 'border-warning/20'
    },
    rojo: {
      icon: XCircle,
      title: 'Acción Necesaria',
      color: 'text-error',
      bgColor: 'bg-error/5',
      borderColor: 'border-error/20'
    }
  };

  // If no analysis data is available, redirect to analysis page
  useEffect(() => {
    if (!analysisData) {
      navigate('/c/analysis');
    }
  }, [analysisData, navigate]);

  // Fetch questionnaire answers from API when viewing an analysis from state
  useEffect(() => {
    if (!analysis?.analysisId) return;
    let cancelled = false;
    setAnswersLoading(true);
    setApiAnswers(null);
    getAnalysisAnswers(analysis.analysisId)
      .then((data) => {
        if (!cancelled) setApiAnswers(data);
      })
      .catch(() => {
        if (!cancelled) setApiAnswers([]);
      })
      .finally(() => {
        if (!cancelled) setAnswersLoading(false);
      });
    return () => { cancelled = true; };
  }, [analysis?.analysisId]);

  if (!analysisData) {
    return (
      <div className="min-h-dvh bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-error" />
              </div>
            </div>
            <h2 className="card-title text-xl mb-4">Análisis no encontrado.</h2>
            <p className="text-base-content/70 mb-6">
              No se encontró información del análisis solicitado.
              Por favor, intente seleccionar un análisis desde la lista.
            </p>
            <div className="card-actions">
              <button onClick={() => navigate('/c/analysis')} className="btn btn-primary gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a análisis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[analysisData.colorSemaforo];
  const StatusIcon = currentStatus.icon;

  // Unified list for the Answers Section: from API when available, else from localStorage
  const displayAnswers: { questionText: string; answerText: string }[] =
    analysis && apiAnswers !== null
      ? apiAnswers.map((a) => ({
        questionText: a.questionText ?? '',
        answerText: a.answerText ?? ''
      }))
      : (parsedQuestionnaireFromLS?.answers ?? []).map((a) => ({
        questionText: a.questionTitle ?? '',
        answerText: Array.isArray(a.answer) ? a.answer.filter(Boolean).join(', ') : String(a.answer ?? '')
      }));
  const hasAnswersFromApi = Boolean(analysis?.analysisId);
  const showAnswersLoading = hasAnswersFromApi && answersLoading;

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return timestamp;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Modern minimalist stoplight with Motion animations
  const stoplight = (
    <motion.div
      className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left side - Stoplight */}
      <motion.div className="flex flex-col items-center justify-center space-y-6 h-full" variants={itemVariants}>
        {/* Status Header */}
        <motion.div className="text-center space-y-4" variants={itemVariants}>
          <motion.div
            className={`inline-flex items-center justify-center w-20 h-20 bg-base-200 rounded-full text-sm font-medium border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">Estado del análisis</h2>
            <motion.div
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {currentStatus.title}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Realistic Stoplight */}
        <motion.div
          className="flex justify-center"
          variants={itemVariants}
        >
          <Stoplight color={analysisData.colorSemaforo} animated />
        </motion.div>
      </motion.div>

      {/* Right side - Summary */}
      <motion.div
        className="flex items-center justify-center h-full"
        variants={itemVariants}
      >
        <motion.div
          className="rounded-xl p-8 bg-base-200 shadow-md w-full max-w-md"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Resumen del Análisis</h3>
          <p className="text-base-content/80 leading-relaxed text-justify">
            {analysisData.recomendacionUsuario}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-dvh"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Header */}
            <motion.div
              className="flex items-center justify-between mb-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => navigate(-1)}
                className="btn btn-outline btn-sm gap-2 text-base-content/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </motion.button>
              <div className="flex items-center gap-4 text-base-content/60 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(analysisData.timestamp)} - {formatTime(analysisData.timestamp)}
                </div>
                <div className="badge badge-outline">
                  ID: {analysisData.id}
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              className="space-y-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >

              {/* Title */}
              <motion.div
                className="text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <h1 className="text-3xl font-bold mb-2">
                  Análisis {formatAnalysisTitle(analysisData.categoria, analysisData.conteo)}
                </h1>
                <p className="text-base-content/60">
                  Análisis personalizado de su situación
                </p>
              </motion.div>

              {/* Stoplight Section */}
              <motion.div
                className="card bg-base-200/50 backdrop-blur-sm shadow-md"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              >
                <div className="card-body">
                  {stoplight}
                </div>
              </motion.div>

              {/* Risk Assessment Card */}
              <motion.div
                className="card bg-base-200/50 shadow-md"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="card-body">
                  <h3 className="card-title text-lg">Nivel de Riesgo</h3>
                  <div className={`card p-4 bg-base-200 gap-2 mt-2 border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}>
                    <div className={`badge font-semibold text-sm badge-lg transition-all duration-300 ${analysisData.colorSemaforo === 'verde' ? 'badge-success' :
                      analysisData.colorSemaforo === 'amarillo' ? 'badge-warning' : 'badge-error'
                      }`}>
                      {getRiskLevel(analysisData.colorSemaforo)}
                    </div>
                    <span className="text-base-content/80">
                      {getRiskDescription(analysisData.colorSemaforo)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Adviser comment (only after adviser has graded; pending analyses show AI text, not adviser) */}
              {analysis?.comentarioAsesor && analysis?.status?.toUpperCase() === 'CHECKED' && (
                <motion.div
                  className="card bg-primary/5 border border-primary/20"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.65, ease: "easeOut" }}
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Comentario del asesor
                    </h3>
                    <p className="text-base-content/80 text-justify whitespace-pre-wrap">
                      {analysis.comentarioAsesor}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Answers Section - Optional placeholder */}
              <motion.div
                className="card bg-base-200/50 shadow-md"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
              >
                <div className="card-body">
                  <div className="collapse">
                    <label htmlFor='checkbox' title='checkbox' hidden>Answers</label>
                    <input
                      type="checkbox"
                      name='checkbox'
                      title='checkbox'
                      checked={showAnswers}
                      onChange={(e) => setShowAnswers(e.target.checked)}
                    />
                    <motion.div
                      className="collapse-title flex items-center justify-center gap-2 cursor-pointer hover:bg-base-300/50 rounded-lg transition-all duration-300"
                      onClick={() => setShowAnswers(!showAnswers)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <motion.div
                        className="transition-transform duration-300"
                        animate={{ rotate: showAnswers ? 180 : 0 }}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                      <span className="font-medium">
                        {showAnswers ? 'Ocultar' : 'Ver'} Respuestas del Cuestionario
                      </span>
                    </motion.div>

                    <AnimatePresence>
                      {showAnswers && (
                        <motion.div
                          className="collapse-content pt-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          {showAnswersLoading ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-base-content/60">
                              <motion.div
                                className="loading loading-spinner loading-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              />
                              <span>Cargando respuestas...</span>
                            </div>
                          ) : displayAnswers.length === 0 ? (
                            <div className="text-center py-8 text-base-content/60">
                              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-60" />
                              <p>No hay respuestas guardadas para este análisis.</p>
                            </div>
                          ) : (
                            <ul className="space-y-3">
                              {displayAnswers.map((a, idx) => (
                                <motion.li
                                  key={`ans-${idx}`}
                                  className="bg-base-100 rounded-lg p-4"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                >
                                  <p className="text-sm font-medium text-base-content/70 mb-1">
                                    Pregunta {idx + 1}
                                  </p>
                                  <p className="text-base-content/90 mb-2">{a.questionText}</p>
                                  <p className="text-sm font-medium text-primary">Respuesta:</p>
                                  <p className="text-base-content/80 whitespace-pre-wrap card border p-4 mt-2 bg-primary/10 border-primary/50">
                                    {a.answerText || '—'}
                                  </p>
                                </motion.li>
                              ))}
                            </ul>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AnalysisReview;