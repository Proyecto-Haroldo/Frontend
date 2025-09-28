import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  AlertCircle
} from 'lucide-react';

function DiagnosticReview() {
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diagnosticId = searchParams.get('id');

  // Get AI recommendation from localStorage
  const aiRecommendation = localStorage.getItem('aiRecommendation');
  const questionnaireData = localStorage.getItem('questionnaireData');

  // Normalize AI data: handle both legacy string and new JSON with resumenUsuario/colorSemaforo
  let resumenUsuario: string = 'Basado en sus respuestas, hemos identificado áreas clave para mejorar su salud financiera...';
  let colorSemaforo: 'rojo' | 'amarillo' | 'verde' = 'amarillo';
  if (aiRecommendation) {
    try {
      const parsed = JSON.parse(aiRecommendation);
      console.log('[DiagnosticReview] parsed aiRecommendation JSON:', parsed);
      if (parsed && typeof parsed === 'object' && 'resumenUsuario' in parsed && 'colorSemaforo' in parsed) {
        const resumenField = (parsed as any).resumenUsuario;
        resumenUsuario = typeof resumenField === 'string' ? resumenField : JSON.stringify(resumenField);
        const rawColor = String((parsed as any).colorSemaforo || colorSemaforo).toLowerCase();
        if (rawColor === 'rojo' || rawColor === 'red') colorSemaforo = 'rojo';
        else if (rawColor === 'amarillo' || rawColor === 'yellow') colorSemaforo = 'amarillo';
        else if (rawColor === 'verde' || rawColor === 'green') colorSemaforo = 'verde';
      } else {
        // Fallback: legacy plain string
        resumenUsuario = aiRecommendation;
      }
    } catch {
      // Not JSON, treat as legacy plain string
      resumenUsuario = aiRecommendation;
    }
  }
  console.log('[DiagnosticReview] normalized resumenUsuario:', resumenUsuario);
  console.log('[DiagnosticReview] normalized colorSemaforo:', colorSemaforo);
  
  // Parse questionnaire data if available
  const parsedQuestionnaireData = questionnaireData ? JSON.parse(questionnaireData) : null;
  
  // This would come from your API/state management in the future
  const diagnostic = {
    id: diagnosticId || 1,
    type: parsedQuestionnaireData?.metadata?.clientType || 'Personal',
    date: parsedQuestionnaireData?.metadata?.timestamp ? new Date(parsedQuestionnaireData.metadata.timestamp).toLocaleDateString('es-ES') : '15 Mar 2024',
    status: 'completed',
    aiAnalysis: {
      summary: typeof resumenUsuario === 'string' ? resumenUsuario : JSON.stringify(resumenUsuario),
      riskAssessment: {
        overall: colorSemaforo === 'verde' ? 'Bajo' : colorSemaforo === 'amarillo' ? 'Moderado' : 'Alto',
        details: colorSemaforo === 'verde' ? 
          'Su situación financiera es estable y saludable.' : 
          colorSemaforo === 'amarillo' ? 
          'Su situación requiere algunas mejoras.' : 
          'Su situación requiere atención inmediata.'
      }
    }
  };

  // Status configuration
  const statusConfig = {
    verde: {
      icon: CheckCircle,
      title: 'Situación Saludable',
      color: 'text-success',
      bgColor: 'bg-success/5',
      borderColor: 'border-success/20'
    },
    amarillo: {
      icon: AlertTriangle, 
      title: 'Requiere Atención',
      color: 'text-warning',
      bgColor: 'bg-warning/5',
      borderColor: 'border-warning/20'
    },
    rojo: {
      icon: XCircle,
      title: 'Acción Necesaria',
      color: 'text-error', 
      bgColor: 'bg-error/5',
      borderColor: 'border-error/20'
    }
  };

  const currentStatus = statusConfig[colorSemaforo];
  const StatusIcon = currentStatus.icon;

  // Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: {
      scale: [1, 1.6],
      opacity: [0.7, 0],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: "easeOut"
      }
    }
  };

  const pingVariants = {
    initial: { scale: 1, opacity: 0.35 },
    animate: {
      scale: [1, 1.9],
      opacity: [0.35, 0],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Modern minimalist stoplight with Motion animations
  const stoplight = (
    <motion.div 
      className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left side - Stoplight */}
      <motion.div className="flex flex-col items-center justify-center space-y-6 h-full" variants={itemVariants}>
        {/* Status Header */}
        <motion.div className="text-center space-y-4" variants={itemVariants}>
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-base-200"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-2">Estado del Diagnóstico</h2>
            <motion.div 
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${currentStatus.bgColor} ${currentStatus.borderColor} ${currentStatus.color}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {currentStatus.title}
            </motion.div>
          </motion.div>
        </motion.div>
  
        {/* Realistic Stoplight */}
        <motion.div 
          className="flex justify-center" 
          variants={itemVariants}
        >
          <div className="relative">
            {/* Stoplight Housing */}
            <motion.div 
              className="bg-neutral rounded-3xl p-6 shadow-2xl border-4 border-neutral-focus"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex flex-col space-y-5">
                
                {/* Green Light (TOP) */}
                <div className="relative flex justify-center">
                  <div className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${
                    colorSemaforo === 'verde' 
                      ? 'bg-green-500 shadow-xl shadow-green-500/60' 
                      : 'bg-neutral-content/10 shadow-inner'
                  }`}>
                    {colorSemaforo === 'verde' && (
                      <>
                        <motion.div 
                          className="absolute inset-2 bg-green-400 rounded-full"
                          variants={pingVariants}
                          initial="initial"
                          animate="animate"
                        />
                        <motion.div 
                          className="absolute inset-3 bg-gradient-to-br from-green-300 via-green-500 to-green-700 rounded-full"
                          variants={pulseVariants}
                          initial="initial"
                          animate="animate"
                        />
                        <div className="absolute top-3 left-3 w-4 h-4 bg-green-200 rounded-full blur-sm opacity-80" />
                      </>
                    )}
                  </div>
                </div>
                
                {/* Yellow Light (MIDDLE) */}
                <div className="relative flex justify-center">
                  <div className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${
                    colorSemaforo === 'amarillo' 
                      ? 'bg-yellow-400 shadow-xl shadow-yellow-400/60' 
                      : 'bg-neutral-content/10 shadow-inner'
                  }`}>
                    {colorSemaforo === 'amarillo' && (
                      <>
                        <motion.div 
                          className="absolute inset-2 bg-yellow-300 rounded-full"
                          variants={pingVariants}
                          initial="initial"
                          animate="animate"
                        />
                        <motion.div 
                          className="absolute inset-3 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-full"
                          variants={pulseVariants}
                          initial="initial"
                          animate="animate"
                        />
                        <div className="absolute top-3 left-3 w-4 h-4 bg-yellow-100 rounded-full blur-sm opacity-80" />
                      </>
                    )}
                  </div>
                </div>
                
                {/* Red Light (BOTTOM) */}
                <div className="relative flex justify-center">
                  <div className={`w-20 h-20 rounded-full border-4 border-neutral-content/20 transition-all duration-700 ${
                    colorSemaforo === 'rojo' 
                      ? 'bg-red-500 shadow-xl shadow-red-500/60' 
                      : 'bg-neutral-content/10 shadow-inner'
                  }`}>
                    {colorSemaforo === 'rojo' && (
                      <>
                        <motion.div 
                          className="absolute inset-2 bg-red-400 rounded-full"
                          variants={pingVariants}
                          initial="initial"
                          animate="animate"
                        />
                        <motion.div 
                          className="absolute inset-3 bg-gradient-to-br from-red-300 via-red-500 to-red-700 rounded-full"
                          variants={pulseVariants}
                          initial="initial"
                          animate="animate"
                        />
                        <div className="absolute top-3 left-3 w-4 h-4 bg-red-200 rounded-full blur-sm opacity-80" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Subtle Glow Effect */}
            {colorSemaforo === 'rojo' && (
              <motion.div 
                className="absolute inset-0 bg-red-500/10 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {colorSemaforo === 'amarillo' && (
              <motion.div 
                className="absolute inset-0 bg-yellow-400/10 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {colorSemaforo === 'verde' && (
              <motion.div 
                className="absolute inset-0 bg-green-500/10 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
  
      {/* Right side - Summary */}
      <motion.div 
        className="flex items-center justify-center h-full"
        variants={itemVariants}
      >
        <motion.div 
          className={`rounded-xl p-8 border ${currentStatus.bgColor} ${currentStatus.borderColor} w-full max-w-md`}
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Resumen del Análisis</h3>
          <p className="text-base-content/80 leading-relaxed text-center">
            {diagnostic.aiAnalysis.summary}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // Effects
  useEffect(() => {
    if (diagnosticId) {
      console.log('Fetching diagnostic with ID:', diagnosticId);
    }
  }, [diagnosticId]);

  useEffect(() => {
    if (!diagnosticId) {
      navigate('/c/diagnostics');
    }
  }, [diagnosticId, navigate]);

  return (
    <motion.div 
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between py-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.button 
                onClick={() => navigate(-1)}
                className="btn btn-ghost btn-sm gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </motion.button>
              <div className="flex items-center gap-2 text-base-content/60 text-sm">
                <Clock className="w-4 h-4" />
                {diagnostic.date}
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
              className="space-y-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >
              
              {/* Title */}
              <motion.div 
                className="text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <h1 className="text-3xl font-bold mb-2">
                  Diagnóstico {diagnostic.type}
                </h1>
                <p className="text-base-content/60">
                  Análisis de su situación financiera
                </p>
              </motion.div>

              {/* Stoplight Section */}
              <motion.div 
                className="card bg-base-200/50 backdrop-blur-sm"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              >
                <div className="card-body">
                  {stoplight}
                </div>
              </motion.div>

              {/* Risk Assessment Cards */}
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
              >
                <motion.div 
                  className="card bg-base-200/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg">Nivel de Riesgo</h3>
                    <div className="flex items-center gap-3">
                      <div className={`badge badge-lg transition-all duration-300 ${
                        colorSemaforo === 'verde' ? 'badge-success' :
                        colorSemaforo === 'amarillo' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {diagnostic.aiAnalysis.riskAssessment.overall}
                      </div>
                      <span className="text-base-content/80 text-sm">
                        {diagnostic.aiAnalysis.riskAssessment.details}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="card bg-base-200/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg">Tipo de Análisis</h3>
                    <div className="flex items-center gap-3">
                      <div className="badge badge-lg badge-primary transition-all duration-300">
                        {diagnostic.type}
                      </div>
                      <span className="text-base-content/80 text-sm">
                        Diagnóstico personalizado
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Answers Section */}
              <motion.div 
                className="card bg-base-200/50"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
              >
                <div className="card-body">
                  <div className="collapse">
                    <input 
                      type="checkbox" 
                      checked={showAnswers}
                      onChange={(e) => setShowAnswers(e.target.checked)}
                    />
                    <motion.div 
                      className="collapse-title flex items-center justify-center gap-2 cursor-pointer hover:bg-base-300/50 rounded-lg transition-all duration-300"
                      onClick={() => setShowAnswers(!showAnswers)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <motion.div 
                        className="transition-transform duration-300"
                        animate={{ rotate: showAnswers ? 180 : 0 }}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                      <span className="font-medium">
                        {showAnswers ? 'Ocultar' : 'Ver'} Respuestas del Cuestionario
                      </span>
                    </motion.div>
                    
                    <AnimatePresence>
                      {showAnswers && (
                        <motion.div 
                          className="collapse-content pt-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="text-center py-8 text-base-content/60">
                            <motion.div 
                              className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                            >
                              <AlertCircle className="h-8 w-8 text-base-content/60" />
                            </motion.div>
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              Esta sección mostrará todas sus respuestas al cuestionario.
                            </motion.p>
                            <motion.div 
                              className="badge badge-outline mt-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              Implementación pendiente
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DiagnosticReview;