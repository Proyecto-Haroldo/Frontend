import React, { useState } from 'react';
import { Users, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function Services() {
  const [selectedType, setSelectedType] = useState<'personal' | 'business' | null>(null);

  return (
    <div className="max-w-4xl space-y-6 md:space-y-8">
      <h1 className="text-2xl font-semibold">Servicios de Consultoría</h1>
      
      {!selectedType ? (
        <div className="space-y-6">
          <p className="text-lg text-neutral-600">
            Selecciona el tipo de servicio que necesitas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <button
              onClick={() => setSelectedType('personal')}
              className="flex flex-col items-center p-6 md:p-8 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-blue-200 transition-colors"
            >
              <Users className="h-12 w-12 md:h-16 md:w-16 text-blue-600 mb-4" />
              <h3 className="text-lg md:text-xl font-medium mb-2">Persona Natural</h3>
              <p className="text-sm md:text-base text-neutral-600 text-center">
                Asesoría financiera personalizada para alcanzar tus objetivos personales
              </p>
            </button>
            
            <button
              onClick={() => setSelectedType('business')}
              className="flex flex-col items-center p-6 md:p-8 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-blue-200 transition-colors"
            >
              <Building2 className="h-12 w-12 md:h-16 md:w-16 text-blue-600 mb-4" />
              <h3 className="text-lg md:text-xl font-medium mb-2">Persona Jurídica</h3>
              <p className="text-sm md:text-base text-neutral-600 text-center">
                Consultoría empresarial para optimizar las operaciones de tu negocio
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 md:p-8">
          <button
            onClick={() => setSelectedType(null)}
            className="text-sm text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Volver
          </button>

          <h2 className="text-xl font-medium mb-6">
            {selectedType === 'personal' ? 'Diagnóstico Personal' : 'Diagnóstico Empresarial'}
          </h2>

          <div className="space-y-6">
            <p className="text-sm md:text-base text-neutral-600">
              {selectedType === 'personal'
                ? 'Complete el siguiente cuestionario para ayudarnos a entender mejor su situación financiera personal y objetivos.'
                : 'Responda las siguientes preguntas para permitirnos evaluar la situación actual de su empresa y sus necesidades.'}
            </p>

            <Link
              to="/diagnostics"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Comenzar Diagnóstico
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;