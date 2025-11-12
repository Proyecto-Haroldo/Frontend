import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
import { 
  ColorSemaforo,
  getRiskLevel,
  getRiskDescription,
  formatAnalysisTitle
} from '../../shared/types/analysis';
import { IAnalysis } from '../../core/models/analysis';

function AnalysisReview() {
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get analysis data from navigation state
  const analysis = location.state?.analysis as IAnalysis | undefined;

  // Fallback: get analysis ID from URL params for direct navigation
  const analysisIdFromUrl = searchParams.get('id');

  // For backward compatibility with localStorage (questionnaire completion flow)
  const aiRecommendationFromLS = localStorage.getItem('aiRecommendation');
  const questionnaireDataFromLS = localStorage.getItem('questionnaireData');

  let analysisData: { 
    id: string; 
    conteo: number;
    timestamp: string; 
    categoria: string;
    recomendacionUsuario: string; 
    colorSemaforo: ColorSemaforo 
  } | null = null;

  if (analysis) {
    // Primary: Use data from navigation state
    // Normalize colorSemaforo to ensure it's a valid ColorSemaforo value
    const rawColor = String(analysis.colorSemaforo || 'amarillo').toLowerCase();
    let colorSemaforo: ColorSemaforo = 'amarillo';
    if (rawColor === 'rojo' || rawColor === 'red') colorSemaforo = 'rojo';
    else if (rawColor === 'amarillo' || rawColor === 'yellow') colorSemaforo = 'amarillo';
    else if (rawColor === 'verde' || rawColor === 'green') colorSemaforo = 'verde';
    
    analysisData = {
      id: analysis.analysisId.toString(),
      conteo: analysis.conteo,
      timestamp: analysis.timeWhenSolved || new Date().toISOString(),
      categoria: analysis.categoria,
      recomendacionUsuario: analysis.recomendacionInicial,
      colorSemaforo: colorSemaforo
    };
  } else if (analysisIdFromUrl && aiRecommendationFromLS) {
    // Fallback for direct URL navigation with localStorage data
    let resumenUsuario = 'Basado en sus respuestas, hemos identificado áreas clave para mejorar su salud financiera...';
    let colorSemaforo: ColorSemaforo = 'amarillo';
    
    try {
      const parsed = JSON.parse(aiRecommendationFromLS);
      if (parsed && typeof parsed === 'object' && 'resumenUsuario' in parsed && 'colorSemaforo' in parsed) {
        const resumenField = (parsed as any).resumenUsuario;
        resumenUsuario = typeof resumenField === 'string' ? resumenField : JSON.stringify(resumenField);
        const rawColor = String((parsed as any).colorSemaforo || colorSemaforo).toLowerCase();
        if (rawColor === 'rojo' || rawColor === 'red') colorSemaforo = 'rojo';
        else if (rawColor === 'amarillo' || rawColor === 'yellow') colorSemaforo = 'amarillo';
        else if (rawColor === 'verde' || rawColor === 'green') colorSemaforo = 'verde';
      } else {
        resumenUsuario = aiRecommendationFromLS;
      }
    } catch {
      resumenUsuario = aiRecommendationFromLS;
    }

    const parsedQuestionnaireData = questionnaireDataFromLS ? JSON.parse(questionnaireDataFromLS) : null;
    
    analysisData = {
      id: analysisIdFromUrl,
      conteo: 1, // Default to 1 for legacy localStorage data
      timestamp: parsedQuestionnaireData?.metadata?.timestamp || new Date().toISOString(),
      categoria: parsedQuestionnaireData?.metadata?.category || 'General',
      recomendacionUsuario: resumenUsuario,
      colorSemaforo: colorSemaforo
    };
  }

  // Status configuration
  const statusConfig: Record<ColorSemaforo, {
    icon: typeof CheckCircle;
    title: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = {
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

  // If no analysis data is available, redirect to analysis page
  useEffect(() => {
    if (!analysisData) {
      navigate('/c/analysis');
    }
  }, [analysisData, navigate]);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-error" />
              </div>
            </div>
            <h2 className="card-title text-xl mb-4">Análisis no encontrado.</h2>
            <p className="text-base-content/70 mb-6">
              No se encontró información del análisis solicitado. 
              Por favor, intente seleccionar un análisis desde la lista.
            </p>
            <div className="card-actions">
              <button onClick={() => navigate('/c/analysis')} className="btn btn-primary gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a análisis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[analysisData.colorSemaforo];
  const StatusIcon = currentStatus.icon;

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return timestamp;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

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
        type: "spring" as const,
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
        ease: "easeOut" as const
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
        ease: "easeOut" as const
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
            <h2 className="text-2xl font-bold mb-2">Estado del análisis</h2>
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
                    analysisData.colorSemaforo === 'verde' 
                      ? 'bg-green-500 shadow-xl shadow-green-500/60' 
                      : 'bg-neutral-content/10 shadow-inner'
                  }`}>
                    {analysisData.colorSemaforo === 'verde' && (
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
                    analysisData.colorSemaforo === 'amarillo' 
                      ? 'bg-yellow-400 shadow-xl shadow-yellow-400/60' 
                      : 'bg-neutral-content/10 shadow-inner'
                  }`}>
                    {analysisData.colorSemaforo === 'amarillo' && (
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
                    analysisData.colorSemaforo === 'rojo' 
                      ? 'bg-red-500 shadow-xl shadow-red-500/60' 
                      : 'bg-neutral-content/10 shadow-inner'
                  }`}>
                    {analysisData.colorSemaforo === 'rojo' && (
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
            {analysisData.colorSemaforo === 'rojo' && (
              <motion.div 
                className="absolute inset-0 bg-red-500/10 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {analysisData.colorSemaforo === 'amarillo' && (
              <motion.div 
                className="absolute inset-0 bg-yellow-400/10 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {analysisData.colorSemaforo === 'verde' && (
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
            {analysisData.recomendacionUsuario}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );

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
              <div className="flex items-center gap-4 text-base-content/60 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(analysisData.timestamp)} - {formatTime(analysisData.timestamp)}
                </div>
                <div className="badge badge-outline">
                  ID: {analysisData.id}
                </div>
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
                  Análisis {formatAnalysisTitle(analysisData.categoria, analysisData.conteo)}
                </h1>
                <p className="text-base-content/60">
                  Análisis personalizado de su situación
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

              {/* Risk Assessment Card */}
              <motion.div 
                className="card bg-base-200/50"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">Nivel de Riesgo</h3>
                  <div className="flex items-center gap-4">
                    <div className={`badge badge-lg px-4 py-3 transition-all duration-300 ${
                      analysisData.colorSemaforo === 'verde' ? 'badge-success' :
                      analysisData.colorSemaforo === 'amarillo' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {getRiskLevel(analysisData.colorSemaforo)}
                    </div>
                    <span className="text-base-content/80">
                      {getRiskDescription(analysisData.colorSemaforo)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Answers Section - Optional placeholder */}
              <motion.div 
                className="card bg-base-200/50"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
              >
                <div className="card-body">
                  <div className="collapse">
                    <label htmlFor='checkbox' title='checkbox' hidden>Answers</label>
                    <input 
                      type="checkbox" 
                      name='checkbox'
                      title='checkbox'
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

export default AnalysisReview;