import { useEffect, useState } from 'react';
import { getAllQuestionnaires } from '../../api/analysisApi';
import { Questionnaire } from '../../core/models/QuestionnaireModel';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ClipboardList, ArrowLeft } from 'lucide-react';
import QuestionnairesSearchTable from '../../shared/ui/components/tables/QuestionnairesSearchTable';
import HeaderStats from '../../shared/ui/components/headers/StatsHeader';
import MetricsTemplate from '../../shared/ui/template/MetricsTemplate';

function AdviserDashboard() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);
  const [errorQuestionnaires, setErrorQuestionnaires] = useState('');
  const [view, setView] = useState<'selector' | 'metrics' | 'questionnaires'>('selector');

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

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
    total: questionnaires.length,
    pending: questionnaires.filter(q => q.state === 'pending').length,
    completed: questionnaires.filter(q => q.state === 'completed').length,
    green: questionnaires.filter(q => q.colorSemaforo === 'verde').length,
    yellow: questionnaires.filter(q => q.colorSemaforo === 'amarillo').length,
    red: questionnaires.filter(q => q.colorSemaforo === 'rojo').length,
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
        loading={loadingQuestionnaires}
        error={errorQuestionnaires}
        stats={stats}
        questionnaires={questionnaires}
      />

      <AnimatePresence mode="wait">
        {view === 'selector' && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
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
                  Gestiona los cuestionarios y analiza sus resultados.
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
      </AnimatePresence>
    </div>
  );
}

export default AdviserDashboard;