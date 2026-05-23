import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  VideoIcon,
  Users,
  ChevronDown,
  Info,
  MapPin,
  Briefcase,
  User,
  Building2,
  Loader2,
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { createSchedule, toIsoDateLocal } from '../../api/schedulesApi';
import { getAllUsers } from '../../api/usersApi';
import { useAuth } from '../../shared/context/AuthContext';
import type { IUser } from '../../core/models/user';

const SERVICES = [
  { value: 'financial-planning', label: 'Planificación Financiera' },
  { value: 'investment', label: 'Gestión de Inversiones' },
  { value: 'tax', label: 'Asesoría Fiscal' },
  { value: 'business', label: 'Consultoría Empresarial' },
] as const;

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
];

function Schedule() {
  const { userId } = useAuth();
  const [modality, setModality] = useState<'virtual' | 'presential'>('virtual');
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [clientKind, setClientKind] = useState<'natural' | 'business'>('natural');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [advisorId, setAdvisorId] = useState('');

  const [advisers, setAdvisers] = useState<IUser[]>([]);
  const [loadingAdvisers, setLoadingAdvisers] = useState(true);
  const [advisersError, setAdvisersError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successMeetLink, setSuccessMeetLink] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const users = await getAllUsers();
        if (cancelled) return;
        const list = users.filter(
          (u) => u.role?.id === 3 && u.status === 'AUTHORIZED'
        );
        setAdvisers(list);
      } catch {
        if (!cancelled) setAdvisersError('No se pudo cargar la lista de asesores.');
      } finally {
        if (!cancelled) setLoadingAdvisers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSuccessMeetLink(null);

    if (!userId) {
      setError('Debe iniciar sesión para agendar.');
      return;
    }
    if (!advisorId) {
      setError('Seleccione un asesor.');
      return;
    }
    if (!serviceType) {
      setError('Seleccione un tipo de servicio.');
      return;
    }
    if (!date) {
      setError('Seleccione una fecha.');
      return;
    }
    if (!time) {
      setError('Seleccione una hora.');
      return;
    }

    setSubmitting(true);
    try {
      const row = await createSchedule({
        clientType: clientKind === 'natural' ? 'PERSONA' : 'EMPRESA',
        serviceType,
        date: toIsoDateLocal(date),
        time,
        modality,
        additionalNotes: additionalNotes.trim() || undefined,
        advisorId: Number(advisorId),
        clientId: userId,
      });
      setSuccessMessage('Cita confirmada.');
      setSuccessMeetLink(row.meetLink);
      setAdditionalNotes('');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message ?? 'No se pudo confirmar la cita.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Agendar Consulta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form className="card bg-base-100" onSubmit={handleSubmit}>
            <div className="card-body space-y-6">
              {advisersError && (
                <div role="alert" className="alert alert-warning text-sm">
                  {advisersError}
                </div>
              )}
              {error && (
                <div role="alert" className="alert alert-error text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div role="status" className="alert alert-success text-sm">
                  <div className="flex flex-col gap-2 w-full">
                    <span>{successMessage}</span>
                    {successMeetLink && (
                      <a
                        href={successMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-hover font-medium break-all"
                      >
                        Abrir Google Meet
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="form-control">
                <label className="label" htmlFor="schedule-advisor">
                  <span className="label-text font-medium">Asesor</span>
                </label>
                <select
                  id="schedule-advisor"
                  className="select select-bordered w-full"
                  value={advisorId}
                  onChange={(ev) => setAdvisorId(ev.target.value)}
                  disabled={loadingAdvisers || submitting}
                  required
                >
                  <option value="">
                    {loadingAdvisers ? 'Cargando…' : 'Seleccione un asesor'}
                  </option>
                  {advisers.map((a) => (
                    <option key={a.userId} value={a.userId}>
                      {a.legalName} — {a.email}
                    </option>
                  ))}
                </select>
                {!loadingAdvisers && advisers.length === 0 && (
                  <p className="text-sm text-warning mt-1">
                    No hay asesores autorizados disponibles por ahora.
                  </p>
                )}
              </div>

              <div>
                <span className="label-text font-medium">Tipo de Cliente</span>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setClientKind('natural')}
                    className={`btn gap-3 justify-start ${
                      clientKind === 'natural' ? 'btn-primary' : 'btn-ghost border border-accent'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Persona Natural</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientKind('business')}
                    className={`btn gap-3 justify-start ${
                      clientKind === 'business' ? 'btn-primary' : 'btn-ghost border border-accent'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Empresa</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="label-text font-medium">Modalidad</span>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setModality('virtual')}
                    className={`btn gap-3 justify-start ${
                      modality === 'virtual' ? 'btn-primary' : 'btn-ghost border border-accent'
                    }`}
                  >
                    <VideoIcon className="h-5 w-5" />
                    <span>Virtual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModality('presential')}
                    className={`btn gap-3 justify-start ${
                      modality === 'presential' ? 'btn-primary' : 'btn-ghost border border-accent'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Presencial</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Fecha</span>
                  </label>
                  <div className="join w-full">
                    <div className="join-item flex items-center px-3 bg-base-200">
                      <Calendar className="h-5 w-5 text-base-content/50" />
                    </div>
                    <div className="relative w-full">
                      <button
                        type="button"
                        popoverTarget="rdp-popover"
                        className="join-item btn btn-ghost border border-accent w-full justify-between font-normal cursor-pointer text-left"
                        style={{ anchorName: '--rdp' } as React.CSSProperties}
                      >
                        {date ? date.toLocaleDateString() : 'Selecciona un día'}
                      </button>
                      <div
                        popover="auto"
                        id="rdp-popover"
                        className="dropdown"
                        style={{ positionAnchor: '--rdp' } as React.CSSProperties}
                      >
                        <DayPicker
                          className="react-day-picker"
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Hora</span>
                  </label>
                  <div className="join w-full">
                    <div className="join-item flex items-center px-3 bg-base-200">
                      <Clock className="h-5 w-5 text-base-content/50" />
                    </div>
                    <div className="dropdown w-full">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn join-item btn-ghost border border-accent w-full justify-between font-normal"
                      >
                        {time || 'Selecciona una hora'}
                        <ChevronDown className="h-4 w-4" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-y-auto shadow-lg"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <li key={slot}>
                            <button type="button" onClick={() => setTime(slot)}>
                              {slot}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Tipo de Servicio</span>
                </label>
                <div className="dropdown w-full">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost border border-accent w-full justify-between font-normal"
                  >
                    {serviceType || 'Selecciona un servicio'}
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full shadow-lg"
                  >
                    {SERVICES.map((service) => (
                      <li key={service.value}>
                        <button type="button" onClick={() => setServiceType(service.label)}>
                          {service.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="schedule-notes">
                  <span className="label-text font-medium">Notas Adicionales</span>
                </label>
                <textarea
                  id="schedule-notes"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                  placeholder="Describe brevemente el motivo de tu consulta…"
                  value={additionalNotes}
                  onChange={(ev) => setAdditionalNotes(ev.target.value)}
                  disabled={submitting}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Confirmando…
                  </>
                ) : (
                  'Confirmar Cita'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Tipos de Reuniones</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <VideoIcon className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-medium">Reunión Virtual</h3>
                    <p className="text-sm text-base-content/70">
                      Recibirá un enlace de Google Meet por correo cuando confirme la cita (modalidad virtual).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-medium">Reunión Presencial</h3>
                    <p className="text-sm text-base-content/70">
                      En nuestras oficinas ubicadas en Av. Principal 123, Oficina 456, Ciudad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Información Importante</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <p className="text-sm text-base-content/70">
                    La duración estándar de una reunión es de 45 minutos.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <p className="text-sm text-base-content/70">
                    Puede reprogramar o cancelar su reunión con al menos 24 horas de anticipación.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <p className="text-sm text-base-content/70">
                    Elija el asesor con el que desea la sesión.
                  </p>
                </div>
                <div className="mt-4 p-3 bg-warning/90 rounded-lg">
                  <p className="text-sm text-warning-content">
                    <span className="font-medium">Nota:</span> Para una asesoría más efectiva, le recomendamos tener
                    listos sus documentos financieros relevantes antes de la reunión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
