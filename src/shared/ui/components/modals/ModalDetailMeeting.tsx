import { ExternalLink, X } from 'lucide-react';
import type { ScheduleRow } from '../../../../core/types/schedule';

interface ModalDetailMeetingProps {
  meeting: ScheduleRow | null;
  onClose: () => void;
}

function ModalDetailMeeting({ meeting, onClose }: ModalDetailMeetingProps) {
  if (!meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card bg-base-100 max-w-lg w-full shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-2">
            <h2 className="card-title text-lg">Detalles de la Cita</h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <dl className="space-y-4 text-sm">
            <div className='space-y-3 card bg-base-200 p-4'>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <dt className="font-medium text-base-content/70">Fecha:</dt>
                <dd>{meeting.date}</dd>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <dt className="font-medium text-base-content/70">Hora:</dt>
                <dd>{meeting.time}</dd>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <dt className="font-medium text-base-content/70">Estado:</dt>
                <dd>
                  <span className={`badge badge-sm ${meeting.status === 'CONFIRMED' ? 'badge-success' :
                    meeting.status === 'PENDING' ? 'badge-warning' :
                      meeting.status === 'CANCELLED' ? 'badge-error' :
                        'badge-info'
                    }`}>
                    {meeting.status}
                  </span>
                </dd>
              </div>
            </div>

            <div className='space-y-3 card bg-base-200 p-4'>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <dt className="font-medium text-base-content/70">Cliente:</dt>
                <dd>{meeting.clientEmail}</dd>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <dt className="font-medium text-base-content/70">Tipo de Cliente:</dt>
                <dd>{meeting.clientType}</dd>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <dt className="font-medium text-base-content/70">Servicio:</dt>
                <dd>{meeting.serviceType}</dd>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <dt className="font-medium text-base-content/70">Modalidad:</dt>
                <dd>{meeting.modality}</dd>
              </div>
              {meeting.additionalNotes && (
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <dt className="font-medium text-base-content/70">Notas:</dt>
                  <dd className="whitespace-pre-wrap">{meeting.additionalNotes}</dd>
                </div>
              )}
            </div>
          </dl>

          <div className="card-actions justify-end mt-4">
            {meeting.meetLink ? (
              <a
                href={meeting.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Google Meet
              </a>
            ) : (
              <span className="text-sm text-base-content/50">Sin enlace Meet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetailMeeting;
