import React from 'react';
import { Calendar, Clock, ArrowRight, AlertCircle, BarChart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Panel Principal</h1>
        <Link
          to="/schedule"
          className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Agendar consulta
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Next Meeting */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Próxima Consulta</h2>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Consulta Virtual</p>
                <p className="text-sm text-neutral-600">Hoy, 15:00</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Ver detalles
            </button>
          </div>
        </div>

        {/* Latest Diagnostic */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Último Diagnóstico</h2>
            <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              Completado
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">
              Diagnóstico Personal - 15 Mar 2024
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-neutral-100 rounded-full">
                <div className="w-full h-full bg-green-500 rounded-full" />
              </div>
              <span className="text-sm text-neutral-600">100%</span>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Ver resultados
            </button>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">En Progreso</h2>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">
              Diagnóstico Empresarial - 18 Mar 2024
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-neutral-100 rounded-full">
                <div className="w-1/2 h-full bg-orange-500 rounded-full" />
              </div>
              <span className="text-sm text-neutral-600">50%</span>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">Resumen Financiero</h2>
            <BarChart className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-600">Ingresos Mensuales</span>
                <span className="font-medium">S/. 5,000</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full">
                <div className="w-3/4 h-full bg-green-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-600">Gastos Fijos</span>
                <span className="font-medium">S/. 2,500</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full">
                <div className="w-1/2 h-full bg-orange-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-600">Ahorro</span>
                <span className="font-medium">S/. 1,000</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full">
                <div className="w-1/4 h-full bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">Objetivos Financieros</h2>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fondo de Emergencia</span>
                <span className="text-sm text-neutral-600">75% completado</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full">
                <div className="w-3/4 h-full bg-blue-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Inversión en Bolsa</span>
                <span className="text-sm text-neutral-600">40% completado</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full">
                <div className="w-2/5 h-full bg-purple-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Reducción de Deuda</span>
                <span className="text-sm text-neutral-600">60% completado</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full">
                <div className="w-3/5 h-full bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;