import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from '../../core/types/analysis';
import { Stoplight } from '../../shared/ui/components/stoplight/Stoplight';
import { IAnalysis } from '../../core/models/analysis';
import { getAnalysisAnswers, getAnalysisById } from '../../api/analysisApi';
import type { QuestionAnswerDTO } from '../../core/types/analysis';

function AnalysisReview() {
  const navigate = useNavigate();
  const [showAnswers, setShowAnswers] = useState(false);
  const [apiAnswers, setApiAnswers] = useState<QuestionAnswerDTO[] | null>(null);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersError, setAnswersError] = useState<string | null>(null);

  // Get analysis data from navigation
  const { id } = useParams();
  const analysisId = Number(id);

  const [analysis, setAnalysis] = useState<IAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!analysisId) {
      navigate('/c/analysis');
      return;
    }

    let isMounted = true;
    setLoading(true);

    getAnalysisById(analysisId)
      .then((data) => {
        if (isMounted) {
          setAnalysis(data);
        }
      })
      .catch((e: unknown) => {
        console.error('Failed to load analysis', e);

        if (isMounted) {
          if (e instanceof Error) {
            setError(`No se pudo cargar el análisis: ${e.message}`);
          } else {
            setError('No se pudo cargar el análisis');
          }

          navigate('/c/analysis');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [analysisId, navigate]);

  // Fetch questionnaire answers from API when viewing an analysis from state
  useEffect(() => {
    if (!analysis) return;

    let cancelled = false;
    setAnswersLoading(true);
    setApiAnswers(null);
    setAnswersError(null);

    getAnalysisAnswers(analysis.analysisId)
      .then((data) => {
        if (!cancelled) {
          setApiAnswers(data);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          console.error('Error loading answers', e);
          setApiAnswers([]);
          setAnswersError(
            e instanceof Error
              ? `No se pudieron cargar las respuestas: ${e.message}`
              : 'No se pudieron cargar las respuestas del cuestionario.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAnswersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [analysis]);

  if (loading) {
    return (
      <div className="bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full container bg-base-100 p-6">
          <div className="card-body items-center text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-2">Cargando análisis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-lg bg-base-100 text-center">
          <div className="card-body">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-error" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ups, ha ocurrido un error!</h2>
            <p className="text-base-content/70">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-dvh bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg bg-base-100 ">
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
                Volver a Análisis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[analysis.colorSemaforo];

  // Unified list for the Answers Section from API
  const displayAnswers =
    apiAnswers?.map((a) => ({
      questionText: a.questionText ?? '',
      answerText: Array.isArray(a.answerText)
        ? a.answerText.filter(Boolean).join(', ')
        : String(a.answerText ?? '')
    })) ?? [];

  const hasAnswers = (apiAnswers?.length ?? 0) > 0;
  const showAnswersLoading = hasAnswers && answersLoading;

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
          <Stoplight color={analysis.colorSemaforo} animated />
        </motion.div>
      </motion.div>

      {/* Right side - Summary */}
      <motion.div
        className="flex items-center justify-center h-full"
        variants={itemVariants}
      >
        <motion.div
          className={`rounded-xl p-8 border w-full ${currentStatus.bgColor} ${currentStatus.borderColor}`}
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Resumen del Análisis</h3>
          <p className="text-base-content/80 leading-relaxed text-justify">
            {analysis.resumenIA}
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
      <div className="container mx-auto space-y-8">
        <div className="card bg-base-100 ">
          <div className="card-body">
            {/* Header */}
            <motion.div
              className="flex flex-col items-start flex-wrap gap-4 mb-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => navigate(-1)}
                className="btn btn-outline btn-sm gap-2 opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </motion.button>
              <div className="flex items-center gap-2 flex-wrap justify-center w-full text-base-content/60 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(analysis.timeWhenSolved)} - {formatTime(analysis.timeWhenSolved)}
                </div>
                <div className="badge badge-outline">
                  ID: {analysis.analysisId}
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
                <h1 className="text-2xl font-bold mb-2">
                  Análisis {formatAnalysisTitle(analysis.categoryName, analysis.analysisId)}
                </h1>
                <p className="text-base-content/60 font-medium text-md">
                  {analysis.questionnaireTitle || "Sin determinar"}
                </p>
              </motion.div>

              {/* Stoplight Section */}
              <motion.div
                className="card bg-base-200/50 backdrop-blur-sm"
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
                className="card bg-base-200/50"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="card-body">
                  <h3 className="card-title text-lg">Nivel de Riesgo</h3>
                  <div className={`card p-4 bg-base-200 gap-2 mt-2 border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}>
                    <div className={`badge font-semibold text-sm badge-lg transition-all duration-300 ${analysis.colorSemaforo === 'verde' ? 'badge-success' :
                      analysis.colorSemaforo === 'amarillo' ? 'badge-warning' : 'badge-error'
                      }`}>
                      {getRiskLevel(analysis.colorSemaforo)}
                    </div>
                    <span className="text-base-content/80">
                      {getRiskDescription(analysis.colorSemaforo)}
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
                className="card bg-base-200/50"
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
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <motion.div
                        className="transition-transform duration-300"
                        animate={{ rotate: showAnswers ? 180 : 0 }}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                      <span className="font-semibold">
                        {showAnswers ? 'Ocultar' : 'Ver'} Respuestas del Cuestionario
                      </span>
                    </motion.div>

                    <AnimatePresence>
                      {showAnswers && (
                        <motion.div
                          className="collapse-content p-0"
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
                          ) : answersError ? (
                            <div className="text-center py-8 text-error">
                              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-80" />
                              <p>{answersError}</p>
                            </div>
                          ) : displayAnswers.length === 0 ? (
                            <div className="text-center py-8 text-base-content/60">
                              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-60" />
                              <p>No hay respuestas guardadas para este análisis.</p>
                            </div>
                          ) : (
                            <ul className="space-y-6 mt-4">
                              {displayAnswers.map((a, idx) => (
                                <motion.li
                                  key={`ans-${idx}`}
                                  className="bg-primary/10 border-primary/50 border rounded-xl p-4"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                >
                                  <p className="text-sm font-semibold text-base-content/80 mb-1">Pregunta {idx + 1}</p>
                                  <p className="text-base-content/90 mb-2">{a.questionText ?? ''}</p>
                                  <p className="text-sm text-primary font-semibold">Respuesta:</p>
                                  <p className="text-sm whitespace-pre-wrap text-primary">{a.answerText ?? ''}</p>
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