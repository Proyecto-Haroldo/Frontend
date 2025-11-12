import { FileText, ArrowRight, Clock, CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserAnalysis } from '../../api/analysisApi';
import {
  mapColorToProgress,
  formatAnalysisTitle,
  type AnalysisStatus
} from '../../shared/types/analysis';
import { useAuth } from '../../shared/context/AuthContext';
import { IAnalysis } from '../../core/models/analysis';

function Analysis() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [analysis, setAnalysis] = useState<IAnalysis[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getUserAnalysis(Number(userId));
        if (mounted) setAnalysis(data);
      } catch (e: unknown) {
        console.error('Failed to load analysis', e);

        // Comprobamos si e es un Error para acceder a message
        if (e instanceof Error) {
          if (mounted) setError(`No se pudieron cargar los análisis: ${e.message}`);
        } else {
          if (mounted) setError('No se pudieron cargar los análisis');
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-base-content/50" />;
    }
  };

  const getStatusText = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      default:
        return 'Pendiente';
    }
  };

  const getSeverityIcon = (color: IAnalysis['colorSemaforo']) => {
    switch (color) {
      case 'verde':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'amarillo':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'rojo':
        return <XCircle className="h-4 w-4 text-error" />;
      default:
        return <AlertCircle className="h-4 w-4 text-base-content/50" />;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES');
    } catch {
      return iso;
    }
  };

  const handleAnalysisClick = (analysis: IAnalysis) => {
    // Navigate to analysis review with the analysis data passed in state
    navigate('/c/analysis-review', {
      state: {
        analysis,
        // For backward compatibility, also include id parameter
        analysisId: analysis.analysisId
      }
    });
  };

  const analysisLength = analysis ? analysis.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis análisis</h1>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div>
            {error && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="alert alert-error max-w-md">
                  <AlertCircle className="h-6 w-6" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            {!analysis && !error && (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                <p className="text-base-content/60">Cargando análisis...</p>
              </div>
            )}
            {analysis && analysis.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
                  <p className="text-lg font-medium text-base-content/60 mb-2">No hay análisis disponibles.</p>
                  <p className="text-sm text-base-content/40">Complete un cuestionario para ver su primer análisis.</p>
                </div>
              </div>
            )}
            {analysis && analysis.map((analysis, index) => {
              // All analysis are at 50% completion, so always show "in-progress" status
              const status: AnalysisStatus = 'in-progress';
              const progress = mapColorToProgress();

              return (
                <div
                  key={analysis.analysisId}
                  className={`flex items-center gap-4 p-6 hover:bg-base-200/70 transition-colors cursor-pointer ${index !== analysisLength - 1 ? 'border-b border-base-200 transition-colors duration-200' : ''
                    }`}
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">análisis {formatAnalysisTitle(analysis.categoria, analysis.conteo)}</h3>
                      {getSeverityIcon(analysis.colorSemaforo)}
                    </div>
                    <p className="text-sm text-base-content/70">{formatDate(analysis?.timeWhenSolved || new Date().toISOString())}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <p className="text-sm font-medium">
                          {getStatusText(status)}
                        </p>
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <progress
                          className="progress progress-primary w-16"
                          value={progress}
                          max="100"
                        />
                        <span className="text-sm text-base-content/70">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost btn-sm"
                      title='analysis'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalysisClick(analysis);
                      }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
