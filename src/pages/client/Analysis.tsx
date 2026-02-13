import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Filter
} from 'lucide-react';
import { getUserAnalysis } from '../../api/analysisApi';
import {
  formatAnalysisTitle,
  calculateTotalProgress,
  type AnalysisStatus
} from '../../shared/types/analysis';
import { useAuth } from '../../shared/context/AuthContext';
import { IAnalysis } from '../../core/models/analysis';

type StatusFilter = 'all' | 'completed' | 'incomplete';
type DateSort = 'newest' | 'oldest';

function Analysis() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [analysis, setAnalysis] = useState<IAnalysis[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateSort, setDateSort] = useState<DateSort>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in-progress':
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-base-content/50" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checked':
      case 'completed':
        return 'Completado';
      case 'in-progress':
      case 'pending':
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

  const handleAnalysisClick = (item: IAnalysis) => {
    navigate('/c/analysis-review', {
      state: { analysis: item, analysisId: item.analysisId }
    });
  };

  const categories = useMemo(() => {
    if (!analysis) return [];
    const set = new Set(analysis.map(a => a.categoria).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [analysis]);

  const filteredAndSortedAnalysis = useMemo(() => {
    if (!analysis) return [];
    let list = [...analysis];
    if (statusFilter === 'completed') list = list.filter(a => a.status === 'checked');
    else if (statusFilter === 'incomplete') list = list.filter(a => a.status !== 'checked');
    if (categoryFilter) list = list.filter(a => a.categoria === categoryFilter);
    list.sort((a, b) => {
      const dateA = new Date(a.timeWhenSolved || 0).getTime();
      const dateB = new Date(b.timeWhenSolved || 0).getTime();
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return list;
  }, [analysis, statusFilter, dateSort, categoryFilter]);

  const analysisLength = filteredAndSortedAnalysis.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Mis análisis</h1>
      </div>

      {analysis && analysis.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-base-content/70">
                <Filter className="h-4 w-4" />
                Filtros
              </span>
              <select
                className="select select-bordered select-sm w-full max-w-[10rem]"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                title="Estado"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completados</option>
                <option value="incomplete">En progreso</option>
              </select>
              <select
                className="select select-bordered select-sm w-full max-w-[10rem]"
                value={dateSort}
                onChange={e => setDateSort(e.target.value as DateSort)}
                title="Orden por fecha"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>
              {categories.length > 0 && (
                <select
                  className="select select-bordered select-sm w-full max-w-[12rem]"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  title="Categoría"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              {(statusFilter !== 'all' || categoryFilter || dateSort !== 'newest') && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('');
                    setDateSort('newest');
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
            {analysis && filteredAndSortedAnalysis.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-base-content/60">
                <Filter className="h-12 w-12 mb-2 opacity-50" />
                <p>No hay análisis que coincidan con los filtros.</p>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-2"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('');
                    setDateSort('newest');
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
            {analysis && filteredAndSortedAnalysis.map((item, index) => {
              const isChecked = item.status === 'checked';
              const status: AnalysisStatus = isChecked ? 'completed' : 'in-progress';
              const progress = calculateTotalProgress(isChecked);

              return (
                <div
                  key={item.analysisId}
                  className={`flex items-center gap-4 p-6 hover:bg-base-200/70 transition-colors cursor-pointer ${index !== analysisLength - 1 ? 'border-b border-base-200' : ''}`}
                  onClick={() => handleAnalysisClick(item)}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">Análisis {formatAnalysisTitle(item.categoria, item.conteo)}</h3>
                      {getSeverityIcon(item.colorSemaforo)}
                      <span className="badge badge-ghost badge-sm text-base-content/60">{item.categoria}</span>
                    </div>
                    <p className="text-sm text-base-content/70">{formatDate(item?.timeWhenSolved || new Date().toISOString())}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <p className="text-sm font-medium">{getStatusText(status)}</p>
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <progress className="progress progress-primary w-16" value={progress} max="100" />
                        <span className="text-sm text-base-content/70">{progress}%</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Ver análisis"
                      onClick={e => {
                        e.stopPropagation();
                        handleAnalysisClick(item);
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
