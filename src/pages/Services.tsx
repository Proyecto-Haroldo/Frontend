import { useState } from 'react';
import { 
  Users, 
  Building2, 
  ArrowRight, 
  ChevronLeft, 
  Lightbulb, 
  Calculator, 
  DollarSign, 
  BarChart2, 
  ClipboardList, 
  FileText, 
  LineChart,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

function Services() {
  const [selectedType, setSelectedType] = useState<'personal' | 'business' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentView, setCurrentView] = useState<'categories' | 'clientType' | 'diagnosticForm'>('categories');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Handle screen transitions
  const transition = (nextView: 'categories' | 'clientType' | 'diagnosticForm', moveDirection: 'forward' | 'backward' = 'forward') => {
    setIsAnimating(true);
    setDirection(moveDirection);
    
    // Wait for fade out to complete
    setTimeout(() => {
      if (nextView === 'categories') {
        setSelectedType(null);
      }
      setCurrentView(nextView);
      
      // Start fade in
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 400); // Match this with the CSS transition duration
  };

  const categories = [
    {
      id: 'estrategia',
      title: 'Estrategia',
      description: 'Planificación estratégica para el crecimiento sostenible',
      icon: <Lightbulb className="h-10 w-10 text-primary" />
    },
    {
      id: 'contabilidad',
      title: 'Contabilidad',
      description: 'Gestión contable y cumplimiento normativo',
      icon: <Calculator className="h-10 w-10 text-primary" />
    },
    {
      id: 'finanzas',
      title: 'Finanzas',
      description: 'Análisis financiero y optimización de recursos',
      icon: <DollarSign className="h-10 w-10 text-primary" />
    },
    {
      id: 'costos',
      title: 'Costos',
      description: 'Estructuración y análisis de costos operativos',
      icon: <BarChart2 className="h-10 w-10 text-primary" />
    },
    {
      id: 'presupuesto',
      title: 'Presupuesto',
      description: 'Planificación presupuestaria para objetivos futuros',
      icon: <ClipboardList className="h-10 w-10 text-primary" />
    },
    {
      id: 'tributaria',
      title: 'Tributaria',
      description: 'Optimización fiscal y cumplimiento tributario',
      icon: <FileText className="h-10 w-10 text-primary" />
    },
    {
      id: 'finanzas-corporativas',
      title: 'Finanzas corporativas',
      description: 'Estrategias financieras para crecimiento empresarial',
      icon: <LineChart className="h-10 w-10 text-primary" />
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    console.log("Categoria", categoryId)
    transition('clientType', 'forward');
  };

  const handleBackToCategories = () => {
    transition('categories', 'backward');
  };

  const handleClientTypeSelect = (type: 'personal' | 'business') => {
    setIsAnimating(true);
    setDirection('forward');
    
    setTimeout(() => {
      setSelectedType(type);
      setCurrentView('diagnosticForm');
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 400);
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Nuestros Servicios</h2>
      <p className="text-center text-base-content/70">Seleccione una categoría para comenzar</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="card-body items-center text-center p-4">
              <div className="mb-3">{category.icon}</div>
              <h3 className="card-title text-lg">{category.title}</h3>
              <p className="text-sm text-base-content/70">{category.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <button
        onClick={handleBackToCategories}
        className="btn btn-link btn-sm p-0 h-auto text-primary w-fit"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a categorías
      </button>
      
      <h2 className="text-xl font-bold">Seleccione el tipo de cliente</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <button
          onClick={() => handleClientTypeSelect('personal')}
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
          onClick={() => handleClientTypeSelect('business')}
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
  );

  const renderDiagnosticForm = () => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex flex-col gap-6">
          <button
            onClick={() => transition('clientType', 'backward')}
            className="btn btn-link btn-sm p-0 h-auto text-primary w-fit"
          >
            <ChevronLeft className="h-4 w-4" /> Volver
          </button>

          <div className="space-y-4">
            <h2 className="card-title text-xl">
              {selectedType === 'personal' ? 'Diagnóstico Personal' : 'Diagnóstico Empresarial'}
            </h2>

            <p className="text-sm md:text-base text-base-content/70">
              {selectedType === 'personal'
                ? 'Complete el siguiente cuestionario para ayudarnos a entender mejor su situación financiera personal y objetivos.'
                : 'Responda las siguientes preguntas para permitirnos evaluar la situación actual de su empresa y sus necesidades.'}
            </p>

            <div className="alert alert-warning">
              <AlertTriangle className="h-5 w-5" />
              <span>Advertencia: Si abandona este formulario, perderá toda la información ingresada.</span>
            </div>

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
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 overflow-hidden">
      <div className="mx-auto max-w-5xl w-full space-y-6 md:space-y-8 px-4">
        <div 
          className={`
            transition-all duration-400 ease-in-out 
            ${isAnimating ? 
              (direction === 'forward' ? 'opacity-0 translate-x-32' : 'opacity-0 -translate-x-32') : 
              'opacity-100 translate-x-0'
            }
          `}
        >
          {currentView === 'categories' && renderCategories()}
          {currentView === 'clientType' && renderTypeSelection()}
          {currentView === 'diagnosticForm' && selectedType && renderDiagnosticForm()}
        </div>
      </div>
    </div>
  );
}

export default Services;