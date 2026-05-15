import { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarClock, ExternalLink, Loader2 } from 'lucide-react';
import { defaultScheduleRange, fetchMySchedules } from '../../api/schedulesApi';
import type { ScheduleRow } from '../../core/types/schedule';

function Meetings() {
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const { from, to } = defaultScheduleRange();
    setLoading(true);
    setError(null);
    fetchMySchedules(from, to)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          let msg = 'No se pudieron cargar las citas.';
          if (axios.isAxiosError(e)) {
            const d = e.response?.data as { message?: string; error?: string } | undefined;
            if (d?.message) msg = d.message;
            else if (d?.error) msg = d.error;
          }
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <CalendarClock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Próximas citas</h1>
          <p className="text-sm text-base-content/70">
            Citas donde usted es el asesor.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-base-content/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando…</span>
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="alert alert-error text-sm">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body text-base-content/70">
            No hay citas en el rango consultado.
          </div>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <li key={row.id}>
              <article className="card bg-base-100 border border-base-300 shadow-sm h-full">
                <div className="card-body gap-2 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-base">
                      {row.date} · {row.time}
                    </span>
                    <span className="badge badge-outline badge-sm shrink-0">{row.status}</span>
                  </div>
                  <dl className="grid grid-cols-1 gap-2 text-base-content/90">
                    <div>
                      <dt className="text-xs text-base-content/60">Cliente</dt>
                      <dd>{row.clientEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-base-content/60">Tipo de cliente</dt>
                      <dd>{row.clientType}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-base-content/60">Servicio</dt>
                      <dd>{row.serviceType}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-base-content/60">Modalidad</dt>
                      <dd>{row.modality}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-base-content/60">Notas adicionales</dt>
                      <dd className="whitespace-pre-wrap">
                        {row.additionalNotes?.trim() ? row.additionalNotes : '—'}
                      </dd>
                    </div>
                  </dl>
                  <div className="card-actions justify-end pt-2">
                    {row.meetLink ? (
                      <a
                        href={row.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Google Meet
                      </a>
                    ) : (
                      <span className="text-xs text-base-content/50">Sin enlace Meet</span>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Meetings;
