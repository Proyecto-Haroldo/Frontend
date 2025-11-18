import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Loader2
} from 'lucide-react';
import { IAnalysis } from '../../../core/models/analysis';
import { getAnalysisById } from '../../../api/analysisApi';
import {
  ColorSemaforo,
  getRiskLevel,
  getRiskDescription,
} from '../../../shared/types/analysis';

function AnalysisOverview({ analysisId }: { analysisId?: number }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [analysis, setAnalysis] = useState<IAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="ml-2">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
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

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-base-200">
                <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Estado del análisis</h2>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}>
                  {currentStatus.title}
                </div>
              </div>
            </div>

            {/* Realistic Stoplight */}
            <div className="relative">
              <div className="bg-neutral rounded-3xl p-6 shadow-2xl border-4 border-neutral-focus">
                <div className="flex flex-col space-y-5">

                  {/* Verde */}
                  <div className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${colorSemaforo === 'verde' ? 'bg-green-500 shadow-xl shadow-green-500/60' : 'bg-neutral-content/10 shadow-inner'}`} />
                  {/* Amarillo */}
                  <div className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${colorSemaforo === 'amarillo' ? 'bg-yellow-400 shadow-xl shadow-yellow-400/60' : 'bg-neutral-content/10 shadow-inner'}`} />
                  {/* Rojo */}
                  <div className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${colorSemaforo === 'rojo' ? 'bg-red-500 shadow-xl shadow-red-500/60' : 'bg-neutral-content/10 shadow-inner'}`} />

                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl p-8 border bg-base-100 shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">Resumen del Análisis</h3>
            <p className="text-base-content/80 leading-relaxed text-justify">
              {analysis.recomendacionInicial || 'No disponible'}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <div className={`badge ${colorSemaforo === 'verde' ? 'badge-success' : colorSemaforo === 'amarillo' ? 'badge-warning' : 'badge-error'}`}>
                {getRiskLevel(colorSemaforo)}
              </div>
              <span className="text-base-content/80">{getRiskDescription(colorSemaforo)}</span>
            </div>
          </div>

        </div>

        {/* Detalles completos del análisis */}
        <div className="card bg-base-100 shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Detalles Completos del Análisis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-base-content/70">ID</label>
              <p>{analysis.analysisId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Estado</label>
              <p>{analysis.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Cliente</label>
              <p>{analysis.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Asesor</label>
              <p className="flex items-center gap-2"><User className="h-4 w-4 text-base-content/60" /> {analysis.asesorName || 'Sin Asignar'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Categoría</label>
              <p>{analysis.categoria}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Fecha de Resolución</label>
              <p>{formatDate(analysis.timeWhenSolved)} {formatTime(analysis.timeWhenSolved)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Fecha Revisado</label>
              <p>{analysis.timeWhenChecked ? `${formatDate(analysis.timeWhenChecked)} ${formatTime(analysis.timeWhenChecked)}` : 'No revisado aún'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Nivel de Riesgo</label>
              <p>{colorSemaforo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Recomendación Inicial</label>
              <p className="bg-base-200 p-2 rounded">{analysis.recomendacionInicial || 'No disponible'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Revisión del Asesor</label>
              <p className="bg-base-200 p-2 rounded">{analysis.contenidoRevision || 'No disponible'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70">Conteo</label>
              <p>{analysis.conteo}</p>
            </div>
          </div>
        </div>

        {/* Sección de respuestas opcional */}
        <div className="card bg-base-200 p-4">
          <label className="flex items-center justify-between cursor-pointer" onClick={() => setShowAnswers(!showAnswers)}>
            <span className="font-medium">Respuestas del Cuestionario</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showAnswers ? 'rotate-180' : 'rotate-0'}`} />
          </label>
          {showAnswers && (
            <div className="mt-4 text-base-content/70">
              <p>Esta sección mostrará todas sus respuestas al cuestionario. Implementación pendiente.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AnalysisOverview;
