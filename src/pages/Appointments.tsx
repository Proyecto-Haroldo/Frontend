import React, { useState } from 'react';
import { Calendar, Clock, VideoIcon, Users } from 'lucide-react';

function Appointments() {
  const [appointmentType, setAppointmentType] = useState<'virtual' | 'presential'>('virtual');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Agendar Consulta</h1>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tipo de Consulta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setAppointmentType('virtual')}
              className={`p-4 rounded-lg border ${
                appointmentType === 'virtual'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              } flex items-center space-x-3`}
            >
              <VideoIcon className={`h-6 w-6 ${
                appointmentType === 'virtual' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={appointmentType === 'virtual' ? 'text-blue-600' : 'text-gray-600'}>
                Consulta Virtual
              </span>
            </button>
            
            <button
              onClick={() => setAppointmentType('presential')}
              className={`p-4 rounded-lg border ${
                appointmentType === 'presential'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              } flex items-center space-x-3`}
            >
              <Users className={`h-6 w-6 ${
                appointmentType === 'presential' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={appointmentType === 'presential' ? 'text-blue-600' : 'text-gray-600'}>
                Consulta Presencial
              </span>
            </button>
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de la Consulta</label>
            <div className="mt-1 relative">
              <input
                type="date"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hora</label>
            <div className="mt-1 relative">
              <input
                type="time"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
              />
              <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo de la Consulta</label>
            <textarea
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe brevemente el motivo de tu consulta..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Confirmar Cita
          </button>
        </form>
      </div>
    </div>
  );
}

export default Appointments;