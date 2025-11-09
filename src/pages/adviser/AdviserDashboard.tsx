import { useEffect, useState } from 'react';
import { getAllAnalysis, getAllQuestionnaires } from '../../api/analysisApi';
import { Questionnaire } from '../../core/models/QuestionnaireModel';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ClipboardList, ArrowLeft } from 'lucide-react';
import QuestionnairesSearchTable from '../../shared/ui/components/tables/QuestionnairesSearchTable';
import HeaderStats from '../../shared/ui/components/headers/StatsHeader';
import MetricsTemplate from '../../shared/ui/template/MetricsTemplate';
import { Analysis } from '../../core/models/AnalysisModel';
import AnalysisSearchTable from '../../shared/ui/components/tables/AnalysisSearchTable';

function AdviserDashboard() {
  const [analysis, setAnalysis] = useState<Analysis[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);
  const [errorQuestionnaires, setErrorQuestionnaires] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [errorAnalysis, setErrorAnalysis] = useState('');
  const [view, setView] = useState<'selector' | 'metrics' | 'questionnaires' | 'analysis'>('selector');

  useEffect(() => {
    fetchQuestionnaires();
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const data = await getAllAnalysis();
      setAnalysis(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching analysis:', error.message);
        setErrorAnalysis(error.message);
      } else {
        console.error('Unexpected error fetching analysis:', error);
        setErrorAnalysis('Unexpected error occurred');
      }
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchQuestionnaires = async () => {
    try {
      setLoadingQuestionnaires(true);
      const data = await getAllQuestionnaires();
      setQuestionnaires(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching questionnaires:', error.message);
        setErrorQuestionnaires(error.message);
      } else {
        console.error('Unexpected error fetching questionnaires:', error);
        setErrorQuestionnaires('Unexpected error occurred');
      }
    } finally {
      setLoadingQuestionnaires(false);
    }
  };

  const handleRefresh = () => {
    fetchQuestionnaires();
  }

  const stats = {
    total: analysis.length,
    pending: analysis.filter(q => q.status === 'pending').length,
    completed: analysis.filter(q => q.status === 'completed').length,
    green: analysis.filter(q => q.colorSemaforo === 'verde').length,
    yellow: analysis.filter(q => q.colorSemaforo === 'amarillo').length,
    red: analysis.filter(q => q.colorSemaforo === 'rojo').length,
  };

  // Animations for the selector cards
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 100, transition: { duration: 0.4 } },
  };

  return (
    <div className="container mx-auto p-3 md:p-4 space-y-6 overflow-hidden">
      <HeaderStats
        onRefresh={handleRefresh}
        loading={loadingAnalysis}
        error={errorAnalysis}
        stats={stats}
        analysis={analysis}
      />

      <AnimatePresence mode="wait">
        {view === 'selector' && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            {/* Card Clientes */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="card bg-base-100 border border-base-200 shadow-md cursor-pointer hover:shadow-lg"
              onClick={() => setView('metrics')}
            >
              <div className="card-body flex flex-col items-center text-center space-y-3">
                <Users className="h-10 w-10 text-primary" />
                <h2 className="card-title text-lg md:text-xl">Métrics</h2>
                <p className="text-sm text-base-content/70">
                  Ver y analizar gráfios estadísticos con métricas de tus questionarios.
                </p>
              </div>
            </motion.div>

            {/* Card Cuestionarios */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="card bg-base-100 border border-base-200 shadow-md cursor-pointer hover:shadow-lg"
              onClick={() => setView('questionnaires')}
            >
              <div className="card-body flex flex-col items-center text-center space-y-3">
                <ClipboardList className="h-10 w-10 text-secondary" />
                <h2 className="card-title text-lg md:text-xl">Cuestionarios</h2>
                <p className="text-sm text-base-content/70">
                  Gestiona los cuestionarios y sus categorías.
                </p>
              </div>
            </motion.div>

            {/* Card Análisis */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="card bg-base-100 border border-base-200 shadow-md cursor-pointer hover:shadow-lg"
              onClick={() => setView('analysis')}
            >
              <div className="card-body flex flex-col items-center text-center space-y-3">
                <ClipboardList className="h-10 w-10 text-secondary" />
                <h2 className="card-title text-lg md:text-xl">Análisis</h2>
                <p className="text-sm text-base-content/70">
                  Gestiona los análisis y analiza sus resultados.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Vista Clientes */}
        {view === 'metrics' && (
          <motion.div
            key="metrics"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setView('selector')}
                className="btn btn-outline btn-sm gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>
            <MetricsTemplate
              loading={loadingQuestionnaires}
              error={errorQuestionnaires}
              questionnaires={questionnaires}
            />
          </motion.div>
        )}

        {/* Vista Cuestionarios */}
        {view === 'questionnaires' && (
          <motion.div
            key="questionnaires"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setView('selector')}
                className="btn btn-outline btn-sm gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>
            <QuestionnairesSearchTable
              loading={loadingQuestionnaires}
              error={errorQuestionnaires}
              questionnaires={questionnaires}
            />
          </motion.div>
        )}

        {/* Vista Análisis */}
        {view === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setView('selector')}
                className="btn btn-outline btn-sm gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>
            <AnalysisSearchTable
              loading={loadingAnalysis}
              error={errorAnalysis}
              analysis={analysis}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdviserDashboard;