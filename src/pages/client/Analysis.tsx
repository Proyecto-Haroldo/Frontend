import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  ArrowRight,
  AlertCircle,
  Filter
} from 'lucide-react';
import { getUserAnalysis } from '../../api/analysisApi';
import {
  calculateTotalProgress,
  type AnalysisStatus
} from '../../core/types/analysis';
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
  }, [userId]);

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CHECKED':
      case 'COMPLETED':
        return 'Completado';
      case 'pending':
      case 'PENDING':
        return 'En revisión';
      default:
        return 'Pendiente';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CHECKED':
      case 'COMPLETED':
        return <div className="min-w-3 w-3 aspect-[1/1] rounded-full bg-primary text-primary-content" />;
      case 'pending':
      case 'PENDING':
        return <div className="min-w-3 w-3 aspect-[1/1] rounded-full bg-secondary text-secondary-content" />;
      default:
        return <div className="min-w-3 w-3 aspect-[1/1] rounded-full bg-base-content/50 text-base-content" />;
    }
  };

  const getSeverityDot = (color: IAnalysis['colorSemaforo']) => {
    switch (color) {
      case 'verde':
        return <div className="min-w-3 w-3 aspect-[1/1] rounded-full bg-success text-success-content" />;
      case 'amarillo':
        return <div className="min-w-3 w-3 aspect-[1/1] rounded-full bg-warning text-warning-content" />;
      case 'rojo':
        return <div className="min-w-3 w-3 aspect-[1/1] rounded-full bg-error text-error-content" />;
      default:
        return <div className="min-w-3 w-3 aspect-[1/1] rounded-full bg-base-content/50 text-base-content" />;
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
    navigate(`/c/analysis/review/${item.analysisId}`);
  };

  const categories = useMemo(() => {
    if (!analysis) return [];
    const set = new Set(analysis.map(a => a.categoryName).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [analysis]);

  const filteredAndSortedAnalysis = useMemo(() => {
    if (!analysis) return [];
    let list = [...analysis];
    if (statusFilter === 'completed') list = list.filter(a => a.status?.toUpperCase() === 'CHECKED');
    else if (statusFilter === 'incomplete') list = list.filter(a => a.status?.toUpperCase() !== 'CHECKED');
    if (categoryFilter) list = list.filter(a => a.categoryName === categoryFilter);
    list.sort((a, b) => {
      const dateA = new Date(a.timeWhenSolved || 0).getTime();
      const dateB = new Date(b.timeWhenSolved || 0).getTime();
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return list;
  }, [analysis, statusFilter, dateSort, categoryFilter]);

  const analysisLength = filteredAndSortedAnalysis.length;

  return (
    <div className='h-full flex items-center justify-center'>
      <div className="space-y-6 container">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-semibold">Mis Análisis</h1>
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
                  <option value="incomplete">En revisión</option>
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
                    <ClipboardList className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
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
                const isChecked = item.status?.toUpperCase() === 'CHECKED';
                const status: AnalysisStatus = isChecked ? 'completed' : 'pending';
                const progress = calculateTotalProgress(isChecked);

                return (
                  <>
                    <div
                      key={item.analysisId}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 hover:bg-base-200/70 transition-colors cursor-pointer ${index !== analysisLength - 1 ? 'border-b border-base-200' : ''}`}
                      onClick={() => handleAnalysisClick(item)}
                    >
                      <div className='flex gap-4 items-center'>
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <ClipboardList className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0>">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-base-content/70">Análisis #{item.analysisId} · {formatDate(item?.timeWhenSolved || new Date().toISOString())}</p>
                            <div className="flex gap-2 w-full items-start justify-start min-w-0">
                              <div className="flex-shrink-0 mt-1">
                                {getSeverityDot(item.colorSemaforo)}
                              </div>
                              <div className="flex w-full flex-col items-start justify-start min-w-0">
                                <h3 className="font-medium flex-1 min-w-0 truncate sm:w-[40vw] md:w-[25vw] lg:w-[35vw] xl:w-[45vw]">
                                  {item.questionnaireTitle || "Sin determinar"}
                                </h3>
                                <p className="text-base-content/70 text-xs font-semibold">
                                  {item.categoryName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap-reverse justify-end self-end">
                        <div className="text-right w-25 flex flex-col items-end justify-end">
                          <div className="flex items-center gap-2 justify-start w-full mb-1">
                            {getStatusDot(status)}
                            <p className="text-sm font-medium">{getStatusText(status)}</p>
                          </div>
                          <div className="flex items-center gap-2 justify-start w-full">
                            <progress
                              className={`progress ${progress === 100 ? "progress-primary" : "progress-secondary"} w-full`}
                              value={progress}
                              max="100"
                            />
                            <span className="text-sm text-base-content/70">{progress}%</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-info btn-sm"
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
                    <hr className="text-base-300 mx-4"></hr>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
