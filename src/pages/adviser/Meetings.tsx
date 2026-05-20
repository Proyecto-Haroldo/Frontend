import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { defaultScheduleRange, fetchMySchedules } from '../../api/schedulesApi';
import type { ScheduleRow } from '../../core/types/schedule';
import ModalDetailMeeting from '../../shared/ui/components/modals/ModalDetailMeeting';
import CalendarMeeting from '../../shared/ui/components/calendar/CalendarMeeting';
import axios from 'axios';

function Meetings() {
  const { userStatus } = useAuth();
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<ScheduleRow | null>(null);

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

  function handleEventClick(meeting: ScheduleRow) {
    setSelectedMeeting(meeting);
  }

  if (userStatus === "UNAUTHORIZED") {
    return <Navigate to="/a" replace />;
  }

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Calendario de Citas</h1>
        <p className="text-base-content/70 mt-2">Visualiza las citas en las que participas como asesor y consulta la información relevante de cada sesión.</p>
      </header>

      {loading && (
        <div className="bg-base-200 flex items-center justify-center">
          <div className="card w-full container bg-base-100 p-6">
            <div className="card-body items-center text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-2">Cargando calendario...</p>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="alert alert-error text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex-1 bg-base-100 rounded-lg border border-base-content/15 overflow-hidden">
          <CalendarMeeting
            events={rows}
            onEventClick={handleEventClick}
          />
        </div>
      )}

      {selectedMeeting && (
        <ModalDetailMeeting
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}
    </div>
  );
}

export default Meetings;
