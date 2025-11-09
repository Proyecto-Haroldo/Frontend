import { Calendar, Clock, ArrowRight, AlertCircle, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Panel Principal</h1>
        <Link
          to="/schedule"
          className="btn btn-primary btn-sm gap-2"
        >
          Agendar consulta
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Next Meeting */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">Próxima Consulta</h2>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Consulta Virtual</p>
                  <p className="text-sm text-base-content/70">Hoy, 15:00</p>
                </div>
              </div>
              <button className="btn btn-link btn-sm p-0 text-primary">
                Ver detalles
              </button>
            </div>
          </div>
        </div>

        {/* Latest Analysis */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">Último análisis</h2>
              <div className="badge badge-success">Completado</div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-base-content/70">
                análisis Personal - 15 Mar 2024
              </p>
              <div className="flex items-center gap-2">
                <progress className="progress progress-success w-full" value="100" max="100"></progress>
                <span className="text-sm text-base-content/70">100%</span>
              </div>
              <button className="btn btn-link btn-sm p-0 text-primary">
                Ver resultados
              </button>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">En Progreso</h2>
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-base-content/70">
                análisis Empresarial - 18 Mar 2024
              </p>
              <div className="flex items-center gap-2">
                <progress className="progress progress-warning w-full" value="50" max="100"></progress>
                <span className="text-sm text-base-content/70">50%</span>
              </div>
              <button className="btn btn-link btn-sm p-0 text-primary">
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h2 className="card-title text-base">Resumen Financiero</h2>
              <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-base-content/70">Ingresos Mensuales</span>
                  <span className="font-medium">S/. 5,000</span>
                </div>
                <progress className="progress progress-success w-full" value="75" max="100"></progress>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-base-content/70">Gastos Fijos</span>
                  <span className="font-medium">S/. 2,500</span>
                </div>
                <progress className="progress progress-warning w-full" value="50" max="100"></progress>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-base-content/70">Ahorro</span>
                  <span className="font-medium">S/. 1,000</span>
                </div>
                <progress className="progress progress-info w-full" value="25" max="100"></progress>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;