import { useState } from 'react';
import { Calendar, Clock, VideoIcon, Users } from 'lucide-react';

function Schedule() {
  const [appointmentType, setAppointmentType] = useState<'virtual' | 'presential'>('virtual');

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">Agendar Consulta</h1>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="space-y-6">
          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Tipo de Consulta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAppointmentType('virtual')}
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  appointmentType === 'virtual'
                    ? 'border-dark-purple bg-light-purple/5 text-dark-purple'
                    : 'border-neutral-200 text-neutral-600'
                }`}
              >
                <VideoIcon className="h-5 w-5" />
                <span>Virtual</span>
              </button>
              
              <button
                onClick={() => setAppointmentType('presential')}
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  appointmentType === 'presential'
                    ? 'border-dark-purple bg-light-purple/5 text-dark-purple'
                    : 'border-neutral-200 text-neutral-600'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Presencial</span>
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Fecha
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full rounded-lg border-neutral-200 pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Hora
              </label>
              <div className="relative">
                <input
                  type="time"
                  className="w-full rounded-lg border-neutral-200 pl-10"
                />
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tipo de Servicio
            </label>
            <select className="w-full rounded-lg border-neutral-200">
              <option value="">Selecciona un servicio</option>
              <option value="financial-planning">Planificación Financiera</option>
              <option value="investment">Gestión de Inversiones</option>
              <option value="tax">Asesoría Fiscal</option>
              <option value="business">Consultoría Empresarial</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border-neutral-200"
              placeholder="Describe brevemente el motivo de tu consulta..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-light-purple text-white py-2.5 px-4 rounded-lg hover:bg-dark-purple transition-colors"
          >
            Confirmar Cita
          </button>
        </div>
      </div>
    </div>
  );
}

export default Schedule;