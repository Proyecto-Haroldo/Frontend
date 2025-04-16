import React, { useState } from 'react';
import { Building2, User } from 'lucide-react';

type UserType = 'personal' | 'business' | null;

function Diagnostic() {
  const [userType, setUserType] = useState<UserType>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Diagnóstico Financiero</h1>
      
      {!userType ? (
        <div className="space-y-8">
          <p className="text-center text-xl text-gray-600">
            Selecciona el tipo de diagnóstico que necesitas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setUserType('personal')}
              className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <User className="h-16 w-16 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Persona Natural</h3>
              <p className="text-gray-600 text-center">
                Para individuos que buscan mejorar sus finanzas personales
              </p>
            </button>
            
            <button
              onClick={() => setUserType('business')}
              className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Building2 className="h-16 w-16 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Persona Jurídica</h3>
              <p className="text-gray-600 text-center">
                Para empresas que necesitan optimizar sus operaciones financieras
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">
            {userType === 'personal' ? 'Diagnóstico Personal' : 'Diagnóstico Empresarial'}
          </h2>
          
          <form className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              
              {userType === 'personal' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DNI</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Razón Social</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RUC</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Financial Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Situación Financiera</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ¿Cuál es tu principal preocupación financiera?
                </label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Selecciona una opción</option>
                  {userType === 'personal' ? (
                    <>
                      <option>Deudas personales</option>
                      <option>Ahorro e inversión</option>
                      <option>Planificación de jubilación</option>
                      <option>Presupuesto familiar</option>
                    </>
                  ) : (
                    <>
                      <option>Flujo de caja</option>
                      <option>Optimización fiscal</option>
                      <option>Financiamiento</option>
                      <option>Gestión de costos</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ¿Tienes un sistema de control financiero?
                </label>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="control"
                      value="yes"
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="control"
                      value="no"
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Enviar Diagnóstico
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Diagnostic;