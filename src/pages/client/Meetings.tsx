import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarClock, Loader2, Plus } from 'lucide-react';
import { defaultScheduleRange, fetchMySchedules } from '../../api/schedulesApi';
import { useAuth } from '../../shared/context/AuthContext';
import type { ScheduleRow } from '../../core/types/schedule';
import MeetingCalendar from '../../shared/ui/components/calendar/MeetingCalendar';
import MeetingDetailModal from '../../shared/ui/components/calendar/MeetingDetailModal';

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
        <div className="flex items-center gap-3">
          <CalendarClock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Mis Citas</h1>
            <p className="text-sm text-base-content/70">
              Calendario de tus reuniones programadas.
            </p>
          </div>
        </div>
        <button
          onClick={handleScheduleMeeting}
          className="btn btn-primary gap-2"
        >
          <Plus className="h-5 w-5" />
          Agendar Consulta
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-base-content/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando calendario…</span>
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="alert alert-error text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex-1 bg-base-100 rounded-lg shadow-sm border border-base-300 overflow-hidden">
          <MeetingCalendar
            events={rows}
            onEventClick={handleEventClick}
          />
        </div>
      )}

      {selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}
    </div>
  );
}

export default Meetings;
