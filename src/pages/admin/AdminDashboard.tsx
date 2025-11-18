import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getAllAnalysis, getAllQuestionnaires } from "../../api/analysisApi";
import { getAllUsers } from "../../api/userApi";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, ArrowLeft, FileText, Users } from "lucide-react";
import { IQuestionnaire } from "../../core/models/questionnaire";
import { IUser } from "../../core/models/user";
import { IAnalysis } from "../../core/models/analysis";
import { useAuth } from "../../shared/context/AuthContext";
import HeaderStats from "../../shared/ui/components/headers/HeaderStats";
import Questionnaire from "./overview/QuestionnaireOverview";
import Analysis from "./overview/AnalysisOverview";
import TableSearchQuestionnaires from "../../shared/ui/components/tables/TableSearchQuestionnaires";
import TableSearchAnalysis from "../../shared/ui/components/tables/TableSearchAnalysis";
import TableSearchUsers from "../../shared/ui/components/tables/TableSearchUsers";

function AdminDashboard({ view: forcedView }: { view?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysis, setAnalysis] = useState<IAnalysis[]>([]);
  const [questionnaires, setQuestionnaires] = useState<IQuestionnaire[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState('');
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);
  const [errorQuestionnaires, setErrorQuestionnaires] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [errorAnalysis, setErrorAnalysis] = useState("");
  const { role } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    fetchQuestionnaires();
    fetchAnalysis();
    fetchUsers();
  }, []);

  const [view, setView] = useState<
    "selector" | "questionnaires" | "users" | "analysis" | "questionnaireOverview" | "analysisOverview"
  >(
    forcedView === "questionnaires"
      ? "questionnaires"
      : forcedView === "users"
        ? "users"
        : forcedView === "analysis"
          ? "analysis"
          : forcedView === "analysisOverview"
            ? "analysisOverview"
            : forcedView === "questionnaireOverview"
              ? "questionnaireOverview"
              : "selector"
  );

  /**
  * -----------------------------------------
  *   Sincronizar vista según id de la URL
  * -----------------------------------------
  *   Si hay un :id → mostramos el overview dependiendo del caso
  *   Si no hay id y estábamos en el overview → volver a questionnaires o analysis
  */
  useEffect(() => {
    if (id) {
      // Si la URL contiene "analysis", activamos el manager de análisis
      if (location.pathname.includes("/analysis/")) {
        setView("analysisOverview");
      } else if (location.pathname.includes("/questionnaires/")) {
        setView("questionnaireOverview");
      }
    }
  }, [id, location.pathname]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching users:', error.message);
        setErrorUsers(error.message);
      } else {
        console.error('Unexpected error fetching users:', error);
        setErrorUsers('Unexpected error occurred');
      }
    } finally {
      setLoadingUsers(false);
    }
  };

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
    fetchUsers();
  };

  const stats = {
    total: analysis.length,
    pending: analysis.filter((q) => q.status === "pending").length,
    completed: analysis.filter((q) => q.status === "completed").length,
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

      <AnimatePresence mode="wait">
        <hr className="text-accent/20 mx-4"></hr>
        {/* --------------------- SELECTOR ---------------------- */}
        {view === "selector" && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2"
          >
            {/* Card Usuarios */}
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
                navigate("/m/users");
                setView("users");
              }}
            >
              <div className="card-body flex flex-col items-center text-center space-y-3">
                <Users className="h-10 w-10 text-primary" />
                <h2 className="card-title text-lg md:text-xl">Usuarios</h2>
                <p className="text-sm text-base-content/70">
                  Ver, filtrar y analizar los usuarios registrados en el sistema.
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
              className="card bg-base-100 border border-base-200 shadow-md cursor-pointer hover:shadow-lg overflow-visible"
              onClick={() => {
                navigate("/m/questionnaires");
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
                navigate("/m/analysis");
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
          </motion.div>
        )}

        {/* ------------------ VISTA USUARIOS --------------------- */}
        {/* Vista Usuarios */}
        {view === 'users' && (
          <motion.div
            key="users"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  navigate("/m");
                  setView("selector");
                }}
                className="btn btn-outline btn-sm gap-2 text-base-content/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>

            <TableSearchUsers
              loading={loadingUsers}
              error={errorUsers}
              users={users}
              role={role}
            />
          </motion.div>
        )}

        {/* ------------------ VISTA CUESTIONARIOS --------------------- */}
        {view === "questionnaires" && (
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
                onClick={() => {
                  navigate("/m");
                  setView("selector");
                }}
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
          </motion.div>
        )}

        {/* ------------------ VISTA ANÁLISIS (RUTA /a/analysis) --------------------- */}
        {view === "analysis" && (
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
                onClick={() => {
                  navigate("/m");
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
          </motion.div>
        )}

        {/* ------------------ VISTA GESTOR DE CUESTIONARIOS (RUTA /a/questionnaire/:id) --------------------- */}
        {view === "questionnaireOverview" && (
          <motion.div
            key="questionnaireOverview"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                navigate("/m/questionnaires");
                setView("questionnaires");
              }}
              className="btn btn-outline btn-sm gap-2 text-base-content/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>

            <Questionnaire questionnaireId={Number(id)} />
          </motion.div>
        )}

        {/* ------------------ VISTA GESTOR DE ANÁLISIS (RUTA /a/analysis/:id) --------------------- */}
        {view === "analysisOverview" && (
          <motion.div
            key="analysisOverview"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                navigate("/m/analysis");
                setView("analysis");
              }}
              className="btn btn-outline btn-sm gap-2 text-base-content/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>

            <Analysis analysisId={Number(id)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
