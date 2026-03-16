import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Loader2,
  MessageSquare,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { IAnalysis } from '../../../core/models/analysis';
import { getAnalysisById, getAnalysisAnswers, gradeAnalysis, formatAnalysisText } from '../../../api/analysisApi';
import { Stoplight } from '../../../shared/ui/components/stoplight/Stoplight';
import type { QuestionAnswerDTO } from '../../../shared/types/analysis';
import {
  ColorSemaforo,
  getRiskLevel,
  getRiskDescription,
} from '../../../shared/types/analysis';

function AnalysisManager({
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

  // Fetch analysis
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!analysisId) return;

      try {
        setLoading(true);
        const data = await getAnalysisById(analysisId);
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
  }, [analysisId, analysis]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="card w-full bg-base-100 shadow-sm border border-base-200">
            <div className="card-body items-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="mt-4">Cargando análisis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-lg bg-base-100 shadow-xl text-center">
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
  const StatusIcon = currentStatus.icon;

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

  const getStateBadge = (state: string) => {
    switch (state) {
      case "pending":
        return (
          <span className="badge badge-warning p-1 badge-sm gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Pendiente</span>
            <span className="sm:hidden">Pend.</span>
          </span>
        );
      case "checked":
      case "completed":
        return (
          <span className="badge badge-success p-1 badge-sm gap-1 text-xs">
            <CheckCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Completado</span>
            <span className="sm:hidden">Comp.</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-neutral p-1 badge-sm text-xs">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="min-h-dvh bg-base-200">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 card bg-base-100 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4 text-base-content/60 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDate(analysis.timeWhenSolved)} - {formatTime(analysis.timeWhenSolved)}
            </div>
            <div className="badge badge-outline">
              ID: {analysis.analysisId}
            </div>
          </div>
        </div>

        {/* Stoplight & Summary */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Stoplight */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full rounded-full text-sm font-medium border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}>
                <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Estado del análisis</h2>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}>
                  {currentStatus.title}
                </div>
              </div>
            </div>

            {/* Realistic Stoplight */}
            <div className="relative">
              <Stoplight color={colorSemaforo} />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl p-8 bg-base-200 shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">Resumen del Análisis</h3>
            <p className="text-base-content/80 text-sm leading-relaxed text-justify">
              {analysis.recomendacionInicial || 'No disponible'}
            </p>
            <div className={`card p-4 bg-base-200 gap-2 mt-4 border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}>
              <div className={`badge text-sm font-semibold ${colorSemaforo === 'verde' ? 'badge-success' : colorSemaforo === 'amarillo' ? 'badge-warning' : 'badge-error'}`}>
                {getRiskLevel(colorSemaforo)}
              </div>
              <span className="text-base-content/80 text-sm">Este cliente ya ha respondido <strong>#{analysis.conteo} cuestionarios.</strong> {getRiskDescription(colorSemaforo)}</span>
            </div>
          </div>
        </div>

        {/* Detalles del análisis */}
        <div className="card bg-base-200 shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Detalles del Análisis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-base-content/70">ID</label>
              <p className='text-sm'>{analysis.analysisId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Estado</label>
              <div>{getStateBadge(analysis.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Cliente</label>
              <p className='text-sm capitalize'>{analysis.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Asesor</label>
              <p className="flex items-center gap-2 text-sm capitalize"><User className="h-4 w-4 text-base-content/60" /> {analysis.asesorName || 'Sin Asignar'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Categoría</label>
              <p className='text-sm capitalize'>{analysis.categoria}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Fecha de Resolución</label>
              <p className='text-sm'>{formatDate(analysis.timeWhenSolved)} · {formatTime(analysis.timeWhenSolved)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Fecha Revisado</label>
              <p className='text-sm'>{analysis.timeWhenChecked ? `${formatDate(analysis.timeWhenChecked)} · ${formatTime(analysis.timeWhenChecked)}` : 'No revisado aún'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Nivel de Riesgo</label>
              <p className='text-sm capitalize'>{colorSemaforo}</p>
            </div>
          </div>
          <div className='mt-4'>
            <label className="text-sm font-medium text-base-content/70 flex flex-col">
              Análisis inicial (IA)
            </label>
            <div
              className="card w-full inline-block border p-4 mt-2 text-sm bg-primary/10 border-primary/50 text-justify max-h-59 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: formatAnalysisText(analysis.contenidoRevision)
              }}
            />
            {analysis.status === 'pending' && analysis.contenidoRevision && (
              <p className="text-xs text-base-content/50 mt-3">* Generado por IA hasta que un asesor revise.</p>
            )}
          </div>
        </div>

        {/* Respuestas del cuestionario */}
        <div className="card bg-base-200 shadow-md">
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

                  <label htmlFor='answers-toggle' className="font-medium">
                    {showAnswers ? "Ocultar" : "Ver"} Respuestas del Cuestionario
                  </label>
                </motion.div>

                <div className="collapse-content">
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
                        <ul className="space-y-3">
                          {answers.map((a, idx) => (
                            <motion.li
                              key={a.questionId != null ? `q-${a.questionId}-${idx}` : idx}
                              className="bg-base-100 rounded-lg p-4"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                            >
                              <p className="text-sm font-medium text-base-content/80 mb-1">Pregunta {idx + 1}</p>
                              <p className="text-base-content/90 mb-2">{a.questionText ?? ''}</p>
                              <p className="text-sm text-primary font-medium">Respuesta:</p>
                              <p className="text-sm text-base-content/80 whitespace-pre-wrap card border p-4 mt-2 bg-primary/10 border-primary/50">{a.answerText ?? ''}</p>
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
        </div>

        {/* Formulario de calificación (solo si está pendiente) */}
        {analysis.status === 'pending' && (
          <div className="card bg-base-200 shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-base-content/70" />
              Revisar análisis
            </h3>
            <p className="text-sm text-base-content/70 mb-4">
              Escriba sus comentarios para el cliente y opcionalmente ajuste el semáforo. Al enviar, el análisis quedará marcado como revisado.
            </p>
            <hr className="text-accent/25 mx-4"></hr>
            {gradeError && (
              <div className="alert alert-error mb-4">
                <XCircle className="h-5 w-5" />
                <span>{gradeError}</span>
              </div>
            )}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="text-sm my-4">* Comentario del asesor (obligatorio)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full min-h-[120px]"
                  placeholder="Ej.: Todo correcto. / Revise la sección 2 y proporcione más detalle..."
                  value={gradingComment}
                  onChange={(e) => setGradingComment(e.target.value)}
                  disabled={isGrading}
                />
              </div>
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="text-sm my-4">* Semáforo (opcional)</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  title='stoplight-color'
                  value={gradingColor}
                  onChange={(e) => setGradingColor(e.target.value)}
                  disabled={isGrading}
                >
                  <option value="">Mantener actual ({analysis.colorSemaforo})</option>
                  <option value="verde">Verde</option>
                  <option value="amarillo">Amarillo</option>
                  <option value="rojo">Rojo</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  className="btn btn-primary gap-2"
                  disabled={!gradingComment.trim() || isGrading}
                  onClick={async () => {
                    setGradeError(null);
                    setIsGrading(true);
                    try {
                      const updated = await gradeAnalysis(analysis.analysisId, {
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

        {analysis.status === 'checked' && analysis.contenidoRevision && (
          <div className="card bg-base-200 shadow-md p-6 border border-base-200">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-base-content/70" />
              Revisón enviada al cliente
            </h3>
            <p className="text-sm text-base-content/80 whitespace-pre-wrap card border p-4 mt-2 bg-primary/10 border-primary/50">{analysis.contenidoRevision}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default AnalysisManager;
