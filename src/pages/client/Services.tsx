import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
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
  AlertTriangle,
  BanknoteArrowUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

function Services() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'persona' | 'empresa' | null>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'clientType' | 'analysisForm'>('clientType');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Handle screen transitions - simplified with Motion React
  const transition = (nextView: 'categories' | 'clientType' | 'analysisForm', moveDirection: 'forward' | 'backward' = 'forward') => {
    setDirection(moveDirection);
    if (nextView === 'clientType') {
      setSelectedType(null);
      setSelectedCategory(null);
    }
    setCurrentView(nextView);
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
      id: 'costos',
      title: 'Costos',
      description: 'Estructuración y análisis de costos operativos',
      icon: <BarChart2 className="h-10 w-10 text-primary" />
    },
    {
      id: 'finanzas-corporativas',
      title: 'Finanzas Corporativas',
      description: 'Estrategias financieras para crecimiento empresarial',
      icon: <LineChart className="h-10 w-10 text-primary" />
    },
    {
      id: 'toma-de-decisiones-finacieras-operativas',
      title: 'Toma de decisiones financieras operativas',
      description: 'Estrategias financieras para crecimiento empresarial',
      icon: <DollarSign className="h-10 w-10 text-primary" />
    },
    {
      id: 'tributacion',
      title: 'Tributación',
      description: 'Optimización fiscal y cumplimiento tributario',
      icon: <FileText className="h-10 w-10 text-primary" />
    },
    {
      id: 'presupuestos',
      title: 'Presupuestos',
      description: 'Planificación presupuestaria para objetivos futuros',
      icon: <ClipboardList className="h-10 w-10 text-primary" />
    },
    {
      id: 'proyectos-de-inversion',
      title: 'Proyectos de inversión',
      description: 'Inversiones para mantener e incrementar el valor de la empresa',
      icon: <BanknoteArrowUp className="h-10 w-10 text-primary" />
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('analysisForm');
    setDirection('forward');
  };

  const handleBackToCategories = () => {
    transition('categories', 'backward');
  };

  const handleClientTypeSelect = (type: 'persona' | 'empresa') => {
    setDirection('forward');
    setSelectedType(type);
    setCurrentView('categories');
  };

  // Animation variants
  const pageVariants = {
    initial: (direction: string) => ({
      x: direction === 'forward' ? 100 : -100,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? -100 : 100,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    })
  };

  // Card hover animation
  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <motion.button
        onClick={() => transition('clientType', 'backward')}
        className="btn btn-link btn-sm p-0 h-auto text-primary w-fit"
        whileHover={{ x: -3 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <ChevronLeft className="h-4 w-4" /> Volver a tipo de persona
      </motion.button>
      <h2 className="text-2xl font-bold text-center">Nuestros Servicios</h2>
      <p className="text-center text-base-content/70">Seleccione una categoría para comenzar</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="card bg-base-100 shadow-sm"
            variants={cardVariants}
            whileHover="hover"
            layout
          >
            <div className="card-body items-center text-center p-4">
              <motion.div 
                className="mb-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {category.icon}
              </motion.div>
              <h3 className="card-title text-lg">{category.title}</h3>
              <p className="text-sm text-base-content/70">{category.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Seleccione el tipo de cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.button
          onClick={() => handleClientTypeSelect('persona')}
          className="card bg-base-100 shadow-sm"
          variants={cardVariants}
          whileHover="hover"
          layout
        >
          <div className="card-body items-center text-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Users className="h-12 w-12 md:h-16 md:w-16 text-primary mb-4" />
            </motion.div>
            <h3 className="card-title text-lg md:text-xl">Persona Natural</h3>
            <p className="text-sm md:text-base text-base-content/70">
              Asesoría financiera personalizada para alcanzar tus objetivos personales
            </p>
          </div>
        </motion.button>
        <motion.button
          onClick={() => handleClientTypeSelect('empresa')}
          className="card bg-base-100 shadow-sm"
          variants={cardVariants}
          whileHover="hover"
          layout
        >
          <div className="card-body items-center text-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Building2 className="h-12 w-12 md:h-16 md:w-16 text-primary mb-4" />
            </motion.div>
            <h3 className="card-title text-lg md:text-xl">Persona Jurídica</h3>
            <p className="text-sm md:text-base text-base-content/70">
              Consultoría empresarial para optimizar las operaciones de tu negocio
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderWarningAlert = () => (
    <motion.div 
      className="alert alert-warning"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <AlertTriangle className="h-5 w-5" />
      <span>Advertencia: Si abandona este formulario, perderá toda la información ingresada.</span>
    </motion.div>
  );
  
  const renderPolicyAcceptance = () => (
    <div className="space-y-4">
      <div className="bg-base-200/60 rounded-lg p-4">
        <div className="text-sm text-base-content/80 mb-3">
          <strong>Política de Privacidad:</strong> De conformidad con lo previsto en las normas sobre protección de datos personales, especialmente lo consagrado en la Ley 1581 de 2012 y sus decretos reglamentarios, autorizo al ITM de manera previa, informada, voluntaria y expresa para que realice el tratamiento de los datos personales consignados en el presente documento y con la finalidad de realizar seguimiento sobre la calidad del servicio prestado por el Consultorio Financiero y Empresarial. Para absolver sus peticiones, solicitudes o reclamos puede consultar la política de tratamiento de datos personales del ITM.
        </div>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-primary flex-shrink-0"
            checked={policyAccepted}
            onChange={e => setPolicyAccepted(e.target.checked)}
          />
          <span className="text-sm">
            He leído y acepto la política de tratamiento de datos personales
          </span>
        </label>
      </div>
    </div>
  );
  
  const renderAnalysisForm = () => (
    <motion.div 
      className="card bg-base-100 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-body">
        <div className="flex flex-col gap-6">
          {/* Back Button */}
          <motion.button
            onClick={handleBackToCategories}
            className="btn btn-link btn-sm p-0 h-auto text-primary w-fit"
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ChevronLeft className="h-4 w-4" /> Volver
          </motion.button>
  
          {/* Header Section */}
          <div className="space-y-3">
            <h2 className="card-title text-xl">
              {selectedType === 'persona' ? 'Diagnóstico Personal' : 'Diagnóstico Empresarial'}
            </h2>
  
            <p className="text-sm md:text-base text-base-content/70">
              {selectedType === 'empresa'
                ? 'Complete el siguiente cuestionario para ayudarnos a entender mejor su situación financiera personal y objetivos.'
                : 'Responda las siguientes preguntas para permitirnos evaluar la situación actual de su empresa y sus necesidades.'}
            </p>
          </div>
  
          {/* Warning Alert Section */}
          {renderWarningAlert()}
  
          {/* Policy Acceptance Section */}
          {renderPolicyAcceptance()}
  
          {/* Action Button */}
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="pt-2"
          >
            {/* Note: clientType parameter removed for now but may be needed in the future for filtering */}
            <Link
              to={`/c/questionnaire?category=${selectedCategory}`}
              className={`btn btn-primary gap-2 ${!policyAccepted ? 'btn-disabled' : ''}`}
              tabIndex={policyAccepted ? 0 : -1}
            >
              Comenzar Diagnóstico
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 overflow-hidden">
      <div className="mx-auto max-w-5xl w-full space-y-6 md:space-y-8 px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentView}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {currentView === 'clientType' && renderTypeSelection()}
            {currentView === 'categories' && selectedType && renderCategories()}
            {currentView === 'analysisForm' && selectedType && renderAnalysisForm()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Services;