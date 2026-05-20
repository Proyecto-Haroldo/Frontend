import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { defaultScheduleRange, fetchMySchedules } from '../../api/schedulesApi';
import { useAuth } from '../../shared/context/AuthContext';
import type { ScheduleRow } from '../../core/types/schedule';
import CalendarMeeting from '../../shared/ui/components/calendar/CalendarMeeting';
import ModalDetailMeeting from '../../shared/ui/components/modals/ModalDetailMeeting';

function Meetings() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<ScheduleRow | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setLoading(false);
      return;
    }

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
  }, [userId]);

  function handleEventClick(meeting: ScheduleRow) {
    setSelectedMeeting(meeting);
  }

  function handleScheduleMeeting() {
    navigate('/c/schedule');
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-6">
        <header className="mb-2">
          <h1 className="text-2xl font-bold">Mis Citas</h1>
          <p className="text-base-content/70 mt-1">
            Consulta el calendario de tus reuniones programadas y visualiza la información relevante de cada sesión.
          </p>
        </header>
        <button
          onClick={handleScheduleMeeting}
          className="btn btn-primary gap-2"
        >
          <Plus className="h-5 w-5" />
          Agendar Consulta
        </button>
      </div>

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
