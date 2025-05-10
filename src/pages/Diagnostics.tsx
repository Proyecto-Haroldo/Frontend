import { FileText, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

function Diagnostics() {
  const diagnostics = [
    {
      id: 1,
      type: 'Personal',
      date: '15 Mar 2024',
      status: 'completed',
      progress: 100
    },
    {
      id: 2,
      type: 'Empresarial',
      date: '18 Mar 2024',
      status: 'in-progress',
      progress: 50
    },
    {
      id: 3,
      type: 'Personal',
      date: '10 Mar 2024',
      status: 'completed',
      progress: 100
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-base-content/50" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis Diagnósticos</h1>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div>
            {diagnostics.map((diagnostic, index) => (
              <div 
                key={diagnostic.id}
                className={`flex items-center gap-4 p-6 hover:bg-base-200/70 transition-colors ${
                  index !== diagnostics.length - 1 ? 'border-b border-base-200 transition-colors duration-200' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Diagnóstico {diagnostic.type}</h3>
                    {getStatusIcon(diagnostic.status)}
                  </div>
                  <p className="text-sm text-base-content/70">{diagnostic.date}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {getStatusText(diagnostic.status)}
                    </p>
                    <div className="flex items-center gap-2">
                      <progress 
                        className="progress progress-primary w-16" 
                        value={diagnostic.progress} 
                        max="100"
                      />
                      <span className="text-sm text-base-content/70">
                        {diagnostic.progress}%
                      </span>
                    </div>
                  </div>
                  
                  <button className="btn btn-ghost btn-sm">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Diagnostics;