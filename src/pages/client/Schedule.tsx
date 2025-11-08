import { useState } from 'react';
import { Calendar, Clock, VideoIcon, Users, ChevronDown, Info, MapPin, User, Building2 } from 'lucide-react';
import { DayPicker } from "react-day-picker";

function Schedule() {
  const [appointmentType, setAppointmentType] = useState<'virtual' | 'presential'>('virtual');
  const [selectedService, setSelectedService] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientType, setClientType] = useState<'natural' | 'business'>('natural');

  const services = [
    { value: 'financial-planning', label: 'Planificación Financiera' },
    { value: 'investment', label: 'Gestión de Inversiones' },
    { value: 'tax', label: 'Asesoría Fiscal' },
    { value: 'business', label: 'Consultoría Empresarial' },
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-8">Agendar Consulta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body space-y-6">
              {/* Client Type */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Tipo de Cliente</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setClientType('natural')}
                    className={`btn gap-3 justify-start ${
                      clientType === 'natural' 
                        ? 'btn-primary' 
                        : 'btn-ghost border border-accent'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Persona Natural</span>
                  </button>
                  
                  <button
                    onClick={() => setClientType('business')}
                    className={`btn gap-3 justify-start ${
                      clientType === 'business' 
                        ? 'btn-primary' 
                        : 'btn-ghost border border-accent'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Empresa</span>
                  </button>
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Tipo de Consulta</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAppointmentType('virtual')}
                    className={`btn gap-3 justify-start ${
                      appointmentType === 'virtual' 
                        ? 'btn-primary' 
                        : 'btn-ghost border border-accent'
                    }`}
                  >
                    <VideoIcon className="h-5 w-5" />
                    <span>Virtual</span>
                  </button>
                  
                  <button
                    onClick={() => setAppointmentType('presential')}
                    className={`btn gap-3 justify-start ${
                      appointmentType === 'presential' 
                        ? 'btn-primary' 
                        : 'btn-ghost border border-accent'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Presencial</span>
                  </button>
                </div>
              </div>

              {/* Date & Time */}
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
                        style={{ anchorName: "--rdp" } as React.CSSProperties}
                      >
                        {date ? date.toLocaleDateString() : "Selecciona un día"}
                      </button>
                      <div 
                        popover="auto" 
                        id="rdp-popover" 
                        className="dropdown" 
                        style={{ positionAnchor: "--rdp" } as React.CSSProperties}
                      >
                        <DayPicker 
                          className="react-day-picker" 
                          mode="single" 
                          selected={date} 
                          onSelect={setDate} 
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
                      <div tabIndex={0} role="button" className="btn join-item btn-ghost border border-accent w-full justify-between font-normal">
                        {selectedTime || 'Selecciona una hora'}
                        <ChevronDown className="h-4 w-4" />
                      </div>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-y-auto">
                        {timeSlots.map((time) => (
                          <li key={time}>
                            <a onClick={() => setSelectedTime(time)}>
                              {time}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Tipo de Servicio</span>
                </label>
                <div className="dropdown w-full">
                  <div tabIndex={0} role="button" className="btn btn-ghost border border-accent w-full justify-between font-normal">
                    {selectedService ? services.find(s => s.value === selectedService)?.label : 'Selecciona un servicio'}
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full">
                    {services.map((service) => (
                      <li key={service.value}>
                        <a onClick={() => setSelectedService(service.value)}>
                          {service.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Notes */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Notas Adicionales</span>
                </label>
                <div className="mt-2">
                  <textarea
                    rows={4}
                    className="textarea textarea-bordered w-full"
                    placeholder="Describe brevemente el motivo de tu consulta..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Confirmar Cita
              </button>
            </div>
          </div>
        </div>

        {/* Side Information */}
        <div className="space-y-6">
          {/* Meeting Types */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Tipos de Reuniones</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <VideoIcon className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Reunión Virtual</h3>
                    <p className="text-sm text-base-content/70">
                      Videollamada a través de Zoom o Microsoft Teams. Recibirá el enlace por correo electrónico.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
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

          {/* Important Information */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Información Importante</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <p className="text-sm text-base-content/70">
                    La duración estándar de una reunión es de 45 minutos.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-primary mt-1" />
                  <p className="text-sm text-base-content/70">
                    Puede reprogramar o cancelar su reunión con al menos 24 horas de anticipación.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Users className="h-5 w-5 text-primary mt-1" />
                  <p className="text-sm text-base-content/70">
                    Le asignaremos un asesor especializado según el tema de su consulta.
                  </p>
                </div>
                <div className="mt-4 p-3 bg-warning/90 rounded-lg">
                  <p className="text-sm text-warning-content">
                    <span className="font-medium">Nota:</span> Para una asesoría más efectiva, le recomendamos tener listos sus documentos financieros relevantes antes de la reunión.
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