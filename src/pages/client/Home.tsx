import { Calendar, Clock, ArrowRight, ArrowDownCircle, HelpCircle, CheckCircle, VideoIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-start justify-center">
      <div className="container space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Latest Analysis - Completed */}
          <div className="card bg-base-100 border border-base-200 col-span-full lg:col-span-1">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-base">Completado</h2>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-base-content/70">
                  Análisis Contabilidad - 15 Mar 2024
                </p>
                <div className="flex items-center gap-2">
                  <progress className="progress progress-success w-full" value="100" max="100"></progress>
                  <span className="text-sm text-base-content/70">100%</span>
                </div>
                <button className="btn btn-outline btn-sm text-base-content/50 text-xs px-4">
                  Ver comentarios
                </button>
              </div>
            </div>
          </div>

          {/* Latest Analysis - Pending */}
          <div className="card bg-base-100 border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-base">En revisión</h2>
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-base-content/70">
                  Análisis Empresarial - 18 Mar 2024
                </p>
                <div className="flex items-center gap-2">
                  <progress className="progress progress-warning w-full" value="50" max="100"></progress>
                  <span className="text-sm text-base-content/70">50%</span>
                </div>
                <button className="btn btn-outline btn-sm text-base-content/50 text-xs px-4">
                  Ver respuestas
                </button>
              </div>
            </div>
          </div>

          {/* Questionnaires */}
          <div className="card bg-base-100 border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-base">#Learn</h2>
                <ArrowDownCircle className="h-5 w-5 text-info" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-base-content/70">
                  Cuestionarios vistos con el tiempo
                </p>
                <div className="flex items-center gap-2">
                  <progress className="progress progress-info w-full" value="30" max="100"></progress>
                  <span className="text-sm text-base-content/70">30/100</span>
                </div>
                <button className="btn btn-outline btn-sm text-base-content/50 text-xs px-4">
                  Ver más cuestionarios
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* Financial Overview */}
          <div className="card bg-base-100 border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h2 className="card-title text-base">Resumen Financiero</h2>
                <HelpCircle className="h-5 w-5 text-secondary" />
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

          {/* Next Meeting */}
          <div className="card bg-base-100 border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-base">Próximas Consultas</h2>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className='flex flex-col gap-4 py-2'>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <VideoIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Consulta Virtual</p>
                      <p className="text-sm text-base-content/70">Hoy, 15:00</p>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm text-base-content/50 text-xs px-4">
                    Ver detalles
                  </button>
                </div>
                <hr className="text-base-200 m-0"></hr>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <VideoIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Consulta Virtual</p>
                      <p className="text-sm text-base-content/70">Hoy, 15:00</p>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm text-base-content/50 text-xs px-4">
                    Ver detalles
                  </button>
                </div>
                <hr className="text-base-200 m-0"></hr>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;