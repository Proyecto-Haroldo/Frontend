import { FileText, ArrowRight, Clock, CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchUserDiagnostics, type Diagnostic } from '../../api/diagnosticApi';
import { 
  mapColorToProgress, 
  formatDiagnosticTitle,
  type DiagnosticStatus 
} from '../../types/diagnostics';

function Diagnostics() {
  const navigate = useNavigate();

  const [diagnostics, setDiagnostics] = useState<Diagnostic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchUserDiagnostics();
        if (mounted) setDiagnostics(data);
      } catch (e: any) {
        console.error('Failed to load diagnostics', e);
        if (mounted) setError('No se pudieron cargar los diagnósticos');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusIcon = (status: DiagnosticStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-base-content/50" />;
    }
  };

  const getStatusText = (status: DiagnosticStatus) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      default:
        return 'Pendiente';
    }
  };

  const getSeverityIcon = (color: Diagnostic['colorSemaforo']) => {
    switch (color) {
      case 'verde':
        return <CheckCircle className="h-4 w-4 text-success"/>;
      case 'amarillo':
        return <AlertTriangle className="h-4 w-4 text-warning"/>;
      case 'rojo':
        return <XCircle className="h-4 w-4 text-error"/>;
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

  const handleDiagnosticClick = (diagnostic: Diagnostic) => {
    // Navigate to diagnostic review with the diagnostic data passed in state
    navigate('/c/diagnostic-review', {
      state: { 
        diagnostic,
        // For backward compatibility, also include id parameter
        diagnosticId: diagnostic.id 
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis Diagnósticos</h1>
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
            {!diagnostics && !error && (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                <p className="text-base-content/60">Cargando diagnósticos...</p>
              </div>
            )}
            {diagnostics && diagnostics.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
                  <p className="text-lg font-medium text-base-content/60 mb-2">No hay diagnósticos disponibles</p>
                  <p className="text-sm text-base-content/40">Complete un cuestionario para ver su primer diagnóstico</p>
                </div>
              </div>
            )}
            {diagnostics && diagnostics.map((diagnostic, index) => {
              // All diagnostics are at 50% completion, so always show "in-progress" status
              const status: DiagnosticStatus = 'in-progress';
              const progress = mapColorToProgress();
              
              return (
                <div 
                  key={diagnostic.id}
                  className={`flex items-center gap-4 p-6 hover:bg-base-200/70 transition-colors cursor-pointer ${
                    index !== diagnostics.length - 1 ? 'border-b border-base-200 transition-colors duration-200' : ''
                  }`}
                  onClick={() => handleDiagnosticClick(diagnostic)}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Diagnóstico {formatDiagnosticTitle(diagnostic.categoria, diagnostic.conteo)}</h3>
                      {getSeverityIcon(diagnostic.colorSemaforo)}
                    </div>
                    <p className="text-sm text-base-content/70">{formatDate(diagnostic.timestamp)}</p>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDiagnosticClick(diagnostic);
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

export default Diagnostics;
