import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  MessageSquare,
  Send,
  CircleDashed
} from 'lucide-react';
import { motion } from 'motion/react';
import { IAnalysis } from '../../../core/models/analysis';
import { getAnalysisById, getAnalysisAnswers, setAnalysisGrade } from '../../../api/analysisApi';
import { Stoplight } from '../components/stoplight/Stoplight';
import type { QuestionAnswerDTO } from '../../../core/types/analysis';
import {
  ColorSemaforo,
  getRiskLevel,
  getRiskDescription,
} from '../../../core/types/analysis';
import { useAuth } from '../../context/AuthContext';
import { formatAnalysisText } from '../../utils/formatAnalysisText';

function TemplateAnalysisReview({
  analysisId,
  onAnalysisUpdated,
}: {
  analysisId?: number;
  onAnalysisUpdated?: (analysis: IAnalysis) => void;
}) {
  const [showAnswers, setShowAnswers] = useState(true);
  const [analysis, setAnalysis] = useState<IAnalysis | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswerDTO[]>([]);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersError, setAnswersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [gradingComment, setGradingComment] = useState('');
  const [gradingColor, setGradingColor] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const { role, userSpecialities } = useAuth();

  const isAdvisor = role === 3;

  // Security check: Verify adviser has access to this analysis category
  const hasAccessToAnalysis = (analysisCategoryName: string) => {
    // Admins have access to everything
    if (role === 1) return true;

    // Advisers must have matching specialities
    if (!userSpecialities || userSpecialities.length === 0) return false;

    const specialityNames = new Set(userSpecialities.map(s => s.title));
    return specialityNames.has(analysisCategoryName);
  };

  // Fetch analysis
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!analysisId) return;

      try {
        setLoading(true);
        const data = await getAnalysisById(analysisId);

        // Security check: Verify access before setting analysis
        if (!hasAccessToAnalysis(data.categoryName)) {
          console.warn('Unauthorized access attempt to analysis:', data.categoryName);
          setError('No tienes permiso para ver este análisis.');
          return;
        }

        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Error al cargar información del análisis.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [analysisId]);

  // Fetch questionnaire answers when analysis is loaded
  useEffect(() => {
    if (!analysisId || !analysis) return;
    let cancelled = false;
    setAnswersLoading(true);
    setAnswersError(null);
    getAnalysisAnswers(analysisId)
      .then((data) => {
        if (!cancelled) setAnswers(data);
      })
      .catch(() => {
        if (!cancelled) {
          setAnswers([]);
          setAnswersError('No se pudieron cargar las respuestas del cuestionario.');
        }
      })
      .finally(() => {
        if (!cancelled) setAnswersLoading(false);
      });
    return () => { cancelled = true; };
  }, [analysisId, analysis, isAdvisor]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="card w-full bg-base-100 border border-base-200">
            <div className="card-body items-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="mt-2">Cargando análisis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-lg bg-base-100 text-center">
          <div className="card-body">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-error" />
            </div>
            <h2 className="text-xl font-bold mb-2">{error ? 'Ups, ha ocurrido un error!' : 'Análisis no encontrado.'}</h2>
            <p className="text-base-content/70">
              {error || 'No se encontró información del análisis solicitado. Por favor, intente seleccionar un análisis desde la lista.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normalizar colorSemaforo
  const rawColor = (analysis.colorSemaforo || 'amarillo').toLowerCase();
  let colorSemaforo: ColorSemaforo = 'amarillo';
  if (rawColor === 'rojo' || rawColor === 'red') colorSemaforo = 'rojo';
  else if (rawColor === 'verde' || rawColor === 'green') colorSemaforo = 'verde';
  else colorSemaforo = 'amarillo';

  // Configuración de íconos y colores
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

  const currentStatus = statusConfig[colorSemaforo];

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

  const getStatusBadge = (state: string) => {
    switch (state?.toUpperCase()) {
      case "PENDING":
        return (
          <span className="badge badge-accent font-semibold p-2 badge-sm gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>Pendiente</span>
          </span>
        );
      case "CHECKED":
      case "COMPLETED":
        return (
          <span className="badge badge-primary font-semibold p-2 badge-sm gap-1 text-xs">
            <CheckCircle className="h-3 w-3" />
            <span>Completado</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-secondary font-semibold p-2 badge-sm text-xs">
            <CircleDashed className="h-3 w-3" />
            <span>Desconocido</span>
          </span>
        );
    }
  };


  const getColorBadge = (color: string) => {
    switch (color) {
      case "verde":
        return (
          <span className="badge badge-success font-semibold p-2 badge-sm text-xs">Verde</span>
        );
      case "amarillo":
        return (
          <span className="badge badge-warning font-semibold p-2 badge-sm text-xs">Amarillo</span>
        );
      case "rojo":
        return (
          <span className="badge badge-error font-semibold p-2 badge-sm text-xs">Rojo</span>
        );
      default:
        return (
          <span className="badge badge-secondary font-semibold p-2 badge-sm text-xs">Desconocido</span>
        );
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
    <div className="min-h-dvh bg-base-200">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 card bg-base-100">

        {/* Header */}
        <div className="flex items-center justify-end">
          <div className="flex items-center justify-center flex-wrap gap-2 text-base-content/60 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDate(analysis.timeWhenSolved)} - {formatTime(analysis.timeWhenSolved)}
            </div>
            <div className="badge badge-outline">
              ID: {analysis.analysisId}
            </div>
          </div>
        </div>

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

        {/* Detalles del análisis */}
        <div className="card bg-base-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Detalles del Análisis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-base-content/70">ID</label>
              <p className='text-sm'>{analysis.analysisId}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/70">Estado</label>
              <div>{getStatusBadge(analysis.status)}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/70">Categoría</label>
              <p className='text-sm capitalize'>{analysis.categoryName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/70">Nivel de Riesgo</label>
              <div>{getColorBadge(analysis.colorSemaforo)}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/70">Cliente</label>
              <p className='text-sm capitalize'>{analysis.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/70">Asesor</label>
              <p className="text-sm capitalize">{analysis.asesorName || 'Sin Asignar'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/70">Fecha de Resolución</label>
              <p className="text-sm">{analysis.timeWhenSolved ? `${formatDate(analysis.timeWhenSolved)}` : 'No registrada'}{analysis.timeWhenSolved ? ` - ${formatTime(analysis.timeWhenSolved)}` : ''}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/70">Fecha de Revisión</label>
              <p className="text-sm">{analysis.timeWhenChecked ? `${formatDate(analysis.timeWhenChecked)}` : 'No revisado aún'}{analysis.timeWhenChecked ? ` - ${formatTime(analysis.timeWhenChecked)}` : ''}</p>
            </div>
          </div>
          <div className='mt-4'>
            <label className="text-sm font-semibold text-base-content/70 flex flex-col">
              Cuestionario
            </label>
            <p className='text-sm'>{analysis.questionnaireTitle}</p>
          </div>
          <div className='mt-4'>
            <label className="text-sm font-semibold text-base-content/70 flex flex-col">
              Análisis inicial (IA)
            </label>
            <div
              className="card w-full inline-block border p-4 mt-2 text-sm bg-primary/10 border-primary/50 text-justify max-h-59 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: formatAnalysisText(analysis.analisisIA)
              }}
            />
            {analysis.analisisIA && (
              <p className="text-xs font-medium text-base-content/50 mt-2">* Texto generado con Gemini AI de Google.</p>
            )}
          </div>
        </div>

        {/* Respuestas del cuestionario */}
        <motion.div
          className="card bg-base-200/50"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
        >
          <div className="card-body">
            <div className="collapse">
              <input
                id="answers-toggle"
                name='answers-toggle'
                type="checkbox"
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

                <label htmlFor='answers-toggle' className="font-semibold">
                  {showAnswers ? "Ocultar" : "Ver"} Respuestas del Cuestionario
                </label>
              </motion.div>

              <div className="collapse-content p-0">
                {showAnswers && (
                  <div className="mt-4 space-y-4">
                    {answersLoading ? (
                      <div className="flex items-center gap-2 text-base-content/60">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Cargando respuestas...</span>
                      </div>
                    ) : answersError ? (
                      <p className="text-error text-sm">{answersError}</p>
                    ) : answers.length === 0 ? (
                      <p className="text-base-content/60 text-sm">No hay respuestas guardadas para este análisis.</p>
                    ) : (
                      <ul className="space-y-6">
                        {answers.map((a, idx) => (
                          <motion.li
                            key={a.questionId != null ? `q-${a.questionId}-${idx}` : idx}
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulario de revisión (solo si está pendiente) */}
        {isAdvisor && analysis.status?.toUpperCase() === 'PENDING' && (
          <div className="card bg-base-200/50 p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-base-content/70" />
              Revisar análisis
            </h3>
            <p className="text-sm text-base-content/70 mb-6">
              Escriba sus comentarios para el cliente y opcionalmente ajuste el semáforo. Al enviar, el análisis quedará marcado como revisado.
            </p>
            {gradeError && (
              <div className="alert alert-error mb-4">
                <XCircle className="h-5 w-5" />
                <span>{gradeError}</span>
              </div>
            )}
            <div className="space-y-4 card bg-base-100 p-4">
              <div className="form-control">
                <label className="label break-words text-sm mb-4 whitespace-normal">
                  * Comentario del asesor (obligatorio)
                </label>
                <textarea
                  className="textarea textarea-bordered w-full min-h-[120px]"
                  placeholder="Revisa la sección de detalles del análisis y añade retroalimentación adicional para el cliente..."
                  value={gradingComment}
                  onChange={(e) => setGradingComment(e.target.value)}
                  disabled={isGrading}
                />
              </div>
              <div className="form-control flex flex-col">
                <label className="label break-words text-sm mb-4 whitespace-normal">
                  * Semáforo (opcional)
                </label>
                <div className="dropdown w-full max-w-xs">
                  <button
                    tabIndex={0}
                    type="button"
                    className="select select-bordered w-full flex items-center"
                  >
                    <span>
                      {!gradingColor
                        ? `Mantener actual (${analysis.colorSemaforo})`
                        : gradingColor === "verde"
                          ? "Verde"
                          : gradingColor === "amarillo"
                            ? "Amarillo"
                            : "Rojo"}
                    </span>
                  </button>

                  <ul className="dropdown-content z-[1] menu p-2 bg-base-300 mt-2 rounded-box w-full shadow-lg">
                    <li>
                      <button
                        type="button"
                        disabled={isGrading}
                        onClick={() => setGradingColor("")}
                      >
                        Mantener actual ({analysis.colorSemaforo})
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        disabled={isGrading}
                        onClick={() => setGradingColor("verde")}
                      >
                        Verde
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        disabled={isGrading}
                        onClick={() => setGradingColor("amarillo")}
                      >
                        Amarillo
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        disabled={isGrading}
                        onClick={() => setGradingColor("rojo")}
                      >
                        Rojo
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className="btn btn-primary gap-2"
                  disabled={!gradingComment.trim() || isGrading}
                  onClick={async () => {
                    setGradeError(null);
                    setIsGrading(true);
                    try {
                      const updated = await setAnalysisGrade(analysis.analysisId, {
                        contenidoRevision: gradingComment.trim(),
                        colorSemaforo: gradingColor.trim() || undefined
                      });
                      setAnalysis(updated);
                      onAnalysisUpdated?.(updated);
                      setGradingComment('');
                      setGradingColor('');
                    } catch (e) {
                      setGradeError(e instanceof Error ? e.message : 'Error al enviar la revisión.');
                    } finally {
                      setIsGrading(false);
                    }
                  }}
                >
                  {isGrading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar revisión
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revisión enviada (solo si está completada) */}
        {analysis.status?.toUpperCase() === 'CHECKED' && analysis.comentarioAsesor && (
          <div className="card bg-base-200/50 p-6 border border-base-200">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-base-content/70" />
              Comentarios del Asesor
            </h3>
            <p className="text-sm text-base-content/80 whitespace-pre-wrap card border p-4 mt-2 bg-primary/10 border-primary/50">{analysis.comentarioAsesor}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default TemplateAnalysisReview;
