import React from 'react';
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-neutral-500" />;
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
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Nuevo Diagnóstico
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-6">
          <div className="space-y-4">
            {diagnostics.map((diagnostic) => (
              <div 
                key={diagnostic.id}
                className="flex items-center gap-4 py-4 border-b border-neutral-200 last:border-0"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Diagnóstico {diagnostic.type}</h3>
                    {getStatusIcon(diagnostic.status)}
                  </div>
                  <p className="text-sm text-neutral-600">{diagnostic.date}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {getStatusText(diagnostic.status)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {diagnostic.progress}% completado
                    </p>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-700">
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