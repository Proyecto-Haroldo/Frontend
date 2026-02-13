import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getAllAnalysis, getAllQuestionnaires } from "../../api/analysisApi";
import { IAnalysis } from "../../core/models/analysis";
import { IQuestionnaire } from "../../core/models/questionnaire";
import { useAuth } from "../../shared/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, ArrowLeft, FileText } from "lucide-react";
import Questionnaire from "./manager/QuestionnaireManager";
import Analysis from "./manager/AnalysisManager";
import HeaderStats from "../../shared/ui/components/headers/HeaderStats";
import TableSearchQuestionnaires from "../../shared/ui/components/tables/TableSearchQuestionnaires";
import TableSearchAnalysis from "../../shared/ui/components/tables/TableSearchAnalysis";

function AdviserDashboard({ view: forcedView }: { view?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysis, setAnalysis] = useState<IAnalysis[]>([]);
  const [questionnaires, setQuestionnaires] = useState<IQuestionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);
  const [errorQuestionnaires, setErrorQuestionnaires] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [errorAnalysis, setErrorAnalysis] = useState("");
  const { role } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    fetchQuestionnaires();
    fetchAnalysis();
  }, []);

  const [view, setView] = useState<
    "selector" | "questionnaires" | "analysis" | "questionnaireManager" | "analysisManager"
  >(
    forcedView === "questionnaires"
      ? "questionnaires"
      : forcedView === "analysis"
        ? "analysis"
        : forcedView === "analysisManager"
          ? "analysisManager"
          : forcedView === "questionnaireManager"
            ? "questionnaireManager"
            : "selector"
  );

  /**
  * -----------------------------------------
  *   Sincronizar vista según id de la URL
  * -----------------------------------------
  *   Si hay un :id → mostramos el manager dependiendo del caso
  *   Si no hay id y estábamos en el manager → volver a questionnaires o analysis
  */
  useEffect(() => {
    if (id) {
      // Si la URL contiene "analysis", activamos el manager de análisis
      if (location.pathname.includes("/analysis/")) {
        setView("analysisManager");
      } else if (location.pathname.includes("/questionnaires/")) {
        setView("questionnaireManager");
      }
    }
  }, [id, location.pathname]);

  const fetchAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const data = await getAllAnalysis();
      setAnalysis(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching analysis:", error.message);
        setErrorAnalysis(error.message);
      } else {
        console.error("Unexpected error fetching analysis:", error);
        setErrorAnalysis("Unexpected error occurred");
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
        console.error("Error fetching questionnaires:", error.message);
        setErrorQuestionnaires(error.message);
      } else {
        console.error("Unexpected error fetching questionnaires:", error);
        setErrorQuestionnaires("Unexpected error occurred");
      }
    } finally {
      setLoadingQuestionnaires(false);
    }
  };

  const handleRefresh = () => {
    fetchQuestionnaires();
    fetchAnalysis();
  };

  const stats = {
    total: analysis.length,
    pending: analysis.filter((q) => q.status === "pending").length,
    completed: analysis.filter((q) => q.status === "checked").length,
    green: analysis.filter((q) => q.colorSemaforo === "verde").length,
    yellow: analysis.filter((q) => q.colorSemaforo === "amarillo").length,
    red: analysis.filter((q) => q.colorSemaforo === "rojo").length,
  };

  // Animations for the selector cards
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 100, transition: { duration: 0.4 } },
  };

  return (
    <div className="container mx-auto space-y-6">
      <HeaderStats
        onRefresh={handleRefresh}
        loading={loadingAnalysis}
        error={errorAnalysis}
        stats={stats}
        analysis={analysis}
        role={role}
      />

      <hr className="text-accent/20 mx-4"></hr>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
        {view === "selector" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {/* Card Cuestionarios */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="card bg-base-100 border border-base-200 shadow-md cursor-pointer hover:shadow-lg overflow-visible"
              onClick={() => {
                navigate("/a/questionnaires");
                setView("questionnaires");
              }}
            >
              <div className="card-body flex flex-col items-center text-center space-y-3">
                <FileText className="h-10 w-10 text-secondary" />
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
              className="card bg-base-100 border border-base-200 shadow-md cursor-pointer hover:shadow-lg overflow-visible"
              onClick={() => {
                navigate("/a/analysis");
                setView("analysis");
              }}
            >
              <div className="card-body flex flex-col items-center text-center space-y-3">
                <ClipboardList className="h-10 w-10 text-secondary" />
                <h2 className="card-title text-lg md:text-xl">Análisis</h2>
                <p className="text-sm text-base-content/70">
                  Gestiona los análisis y analiza sus resultados.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* ------------------ VISTA CUESTIONARIOS --------------------- */}
        {view === "questionnaires" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  navigate("/a");
                  setView("selector");
                }
                }
                className="btn btn-outline btn-sm gap-2 text-base-content/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>

            <TableSearchQuestionnaires
              loading={loadingQuestionnaires}
              error={errorQuestionnaires}
              questionnaires={questionnaires}
              role={role}
            />
          </div>
        )}

        {/* ------------------ VISTA ANÁLISIS (RUTA /a/analysis) --------------------- */}
        {view === "analysis" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  navigate("/a");
                  setView("selector");
                }}
                className="btn btn-outline btn-sm gap-2 text-base-content/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>

            <TableSearchAnalysis
              loading={loadingAnalysis}
              error={errorAnalysis}
              analysis={analysis}
              role={role}
            />
          </div>
        )}

        {/* ------------------ VISTA GESTOR DE CUESTIONARIOS (RUTA /a/questionnaire/:id) --------------------- */}
        {view === "questionnaireManager" && (
          <div className="space-y-4">
            <button
              onClick={() => {
                navigate("/a/questionnaires");
                setView("questionnaires");
              }}
              className="btn btn-outline btn-sm gap-2 text-base-content/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <Questionnaire questionnaireId={Number(id)} />
          </div>
        )}

        {/* ------------------ VISTA GESTOR DE ANÁLISIS (RUTA /a/analysis/:id) --------------------- */}
        {view === "analysisManager" && (
          <div className="space-y-4">
            <button
              onClick={() => {
                navigate("/a/analysis");
                setView("analysis");
              }}
              className="btn btn-outline btn-sm gap-2 text-base-content/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <Analysis analysisId={Number(id)} />
          </div>
        )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AdviserDashboard;
