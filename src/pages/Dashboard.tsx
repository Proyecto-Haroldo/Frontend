import { BarChart, PieChart, Calendar, Clock } from 'lucide-react';

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Diagnósticos</h3>
            <BarChart className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">3</p>
          <p className="text-sm text-gray-600">Pendientes de revisión</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Citas</h3>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">2</p>
          <p className="text-sm text-gray-600">Programadas esta semana</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Tiempo Promedio</h3>
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">1.5d</p>
          <p className="text-sm text-gray-600">Respuesta diagnóstico</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Satisfacción</h3>
            <PieChart className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">95%</p>
          <p className="text-sm text-gray-600">Clientes satisfechos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Próximas Citas</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Juan Pérez</p>
                  <p className="text-sm text-gray-600">Consulta Virtual</p>
                </div>
                <span className="text-sm text-blue-600">Hoy, 15:00</span>
              </div>
            </div>
            <div className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Empresa ABC S.A.</p>
                  <p className="text-sm text-gray-600">Consulta Presencial</p>
                </div>
                <span className="text-sm text-blue-600">Mañana, 10:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Diagnósticos Pendientes</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">María González</p>
                  <p className="text-sm text-gray-600">Diagnóstico Personal</p>
                </div>
                <span className="text-sm text-orange-600">Pendiente</span>
              </div>
              <p className="text-sm text-gray-600">Enviado hace 1 día</p>
            </div>
            <div className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Inversiones XYZ</p>
                  <p className="text-sm text-gray-600">Diagnóstico Empresarial</p>
                </div>
                <span className="text-sm text-orange-600">Pendiente</span>
              </div>
              <p className="text-sm text-gray-600">Enviado hace 2 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;