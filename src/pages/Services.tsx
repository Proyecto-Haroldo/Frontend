import { useState } from 'react';
import { Users, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function Services() {
  const [selectedType, setSelectedType] = useState<'personal' | 'business' | null>(null);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="mx-auto max-w-4xl w-full space-y-6 md:space-y-8 px-4">
        {!selectedType ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <button
                onClick={() => setSelectedType('personal')}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body items-center text-center">
                  <Users className="h-12 w-12 md:h-16 md:w-16 text-primary mb-4" />
                  <h3 className="card-title text-lg md:text-xl">Persona Natural</h3>
                  <p className="text-sm md:text-base text-base-content/70">
                    Asesoría financiera personalizada para alcanzar tus objetivos personales
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedType('business')}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body items-center text-center">
                  <Building2 className="h-12 w-12 md:h-16 md:w-16 text-primary mb-4" />
                  <h3 className="card-title text-lg md:text-xl">Persona Jurídica</h3>
                  <p className="text-sm md:text-base text-base-content/70">
                    Consultoría empresarial para optimizar las operaciones de tu negocio
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => setSelectedType(null)}
                  className="btn btn-link btn-sm p-0 h-auto text-primary w-fit"
                >
                  ← Volver
                </button>

                <div className="space-y-3">
                  <h2 className="card-title text-xl">
                    {selectedType === 'personal' ? 'Diagnóstico Personal' : 'Diagnóstico Empresarial'}
                  </h2>

                  <p className="text-sm md:text-base text-base-content/70">
                    {selectedType === 'personal'
                      ? 'Complete el siguiente cuestionario para ayudarnos a entender mejor su situación financiera personal y objetivos.'
                      : 'Responda las siguientes preguntas para permitirnos evaluar la situación actual de su empresa y sus necesidades.'}
                  </p>

                  <Link
                    to="/questionnaire"
                    className="btn btn-primary gap-2"
                  >
                    Comenzar Diagnóstico
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;