import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getAllAnalysis } from "../../api/analysisApi";
import { getAllQuestionnaires } from "../../api/questionnairesApi";
import { getUserById } from "../../api/usersApi";
import { getUserStatus } from "../../api/authApi";
import { IAnalysis } from "../../core/models/analysis";
import { IQuestionnaire } from "../../core/models/questionnaire";
import { useAuth } from "../../shared/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, ArrowLeft, Briefcase, Loader2, Lock } from "lucide-react";
import Questions from "../../shared/ui/template/TemplateQuestions";
import AnalysisReview from "../../shared/ui/template/TemplateAnalysisReview";
import HeaderStats from "../../shared/ui/components/headers/HeaderStats";
import Analysis from "../../shared/ui/template/TemplateAnalysis";
import Questionnaires from "../../shared/ui/template/TemplateQuestionnaires";

function AdviserDashboard({ view: forcedView }: { view?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysis, setAnalysis] = useState<IAnalysis[]>([]);
  const [questionnaires, setQuestionnaires] = useState<IQuestionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);
  const [errorQuestionnaires, setErrorQuestionnaires] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [errorAnalysis, setErrorAnalysis] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const { role, userStatus, token, userId, userSpecialities, setAuth } = useAuth();
  const { id } = useParams();

  // Fetch and cache specialities for advisers
  useEffect(() => {
    if (role == 3 && userId && !userSpecialities) {
      const fetchAndCacheSpecialities = async () => {
        try {
          const userData = await getUserById(userId);
          setAuth(token, role, userId, userStatus, userData.specialities || null);
        } catch (error) {
          console.warn('Error fetching user specialities:', error);
        }
      };

      fetchAndCacheSpecialities();
    }
  }, [userId, userSpecialities, role, token, userStatus, setAuth]);

  useEffect(() => {
    fetchQuestionnaires();
    fetchAnalysis();
  }, [userSpecialities]);

  const [view, setView] = useState<
    "selector" | "questionnaires" | "analysis" | "questions" | "analysisReview"
  >(
    forcedView === "questionnaires"
      ? "questionnaires"
      : forcedView === "analysis"
        ? "analysis"
        : forcedView === "analysisReview"
          ? "analysisReview"
          : forcedView === "questions"
            ? "questions"
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
    const path = location.pathname;

    if (id) {
      if (path.includes("/analysis/")) {
        setView("analysisReview");
      } else if (path.includes("/questionnaires/")) {
        setView("questions");
      }
    } else {
      if (path === "/a" || path === "/a/") {
        setView("selector");
      } else if (path.includes("/analysis")) {
        setView("analysis");
      } else if (path.includes("/questionnaires")) {
        setView("questionnaires");
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

  // Filter analysis based on user specialities for advisers
  const visibleAnalysis = useMemo(() => {
    // If specialities haven't loaded yet, show nothing
    if (!userSpecialities || userSpecialities.length === 0) return [];

    const specialityNames = new Set(userSpecialities.map(s => s.title));

    const filtered = analysis.filter(a => {
      // Check if analysis category matches adviser specialities
      return specialityNames.has(a.categoryName);
    });

    return filtered;
  }, [analysis, userSpecialities]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const checkUserStatus = async () => {
    if (!userId) return;

    try {
      setLoadingStatus(true);
      await sleep(2000);

      const statusData = await getUserStatus(userId);
      setAuth(token, role, userId, statusData.status);

      window.location.reload();
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (!userId || userStatus == "AUTHORIZED") return;

    const fetchStatus = async () => {
      try {
        const statusData = await getUserStatus(userId);
        setAuth(token, role, userId, statusData.status);
      } catch (err) {
        console.error("Failed to fetch user status:", err);
      }
    };

    fetchStatus();
  }, [role, setAuth, token, userId, userStatus]);

  const stats = {
    total: visibleAnalysis.length,
    pending: visibleAnalysis.filter((q) => q.status?.toUpperCase() === "PENDING").length,
    completed: visibleAnalysis.filter((q) => q.status?.toUpperCase() === "CHECKED").length,
    green: visibleAnalysis.filter((q) => q.colorSemaforo === "verde").length,
    yellow: visibleAnalysis.filter((q) => q.colorSemaforo === "amarillo").length,
    red: visibleAnalysis.filter((q) => q.colorSemaforo === "rojo").length,
  };

  // Animations for the selector cards
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 100, transition: { duration: 0.4 } },
  };

  // Check if user is UNAUTHORIZED and show authorization message
  if (userStatus === "UNAUTHORIZED") {
    return (
      <div className="min-h-[calc(100dvh-8rem)] md:min-h-[calc(100dvh-4rem)] py-4 flex items-center justify-center bg-base-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full mx-4 p-8 bg-base-100 rounded-xl text-center"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-3">
              Autorización Pendiente
            </h2>
            <p className="text-base-content/70 mb-7">
              Tu cuenta está pendiente de autorización. Por favor, espera a que un administrador te habilite para obtener acceso completo a la plataforma.
            </p>
          </div>

          <div className="space-y-4 px-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkUserStatus}
              disabled={loadingStatus}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loadingStatus ? (
                <Loader2 className="h-6 w-6 text-secondary animate-spin mx-auto" />
              ) : (
                "Verificar estado"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <HeaderStats
        onRefresh={handleRefresh}
        loading={loadingAnalysis}
        error={errorAnalysis}
        stats={stats}
        analysis={visibleAnalysis}
        role={role}
      />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Cuestionarios */}
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="card bg-base-100 border border-base-200 cursor-pointer hover:overflow-visible"
                onClick={() => {
                  navigate("/a/questionnaires");
                  setView("questionnaires");
                }}
              >
                <div className="card-body flex flex-col items-center text-center space-y-1">
                  <Briefcase className="h-10 w-10 text-primary" />
                  <h2 className="card-title text-lg md:text-xl">Servicios</h2>
                  <p className="text-sm text-base-content/70">
                    Observa los cuestionarios de cada categoría.
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
                className="card bg-base-100 border border-base-200 cursor-pointer hover:overflow-visible"
                onClick={() => {
                  navigate("/a/analysis");
                  setView("analysis");
                }}
              >
                <div className="card-body flex flex-col items-center text-center space-y-1">
                  <ClipboardList className="h-10 w-10 text-primary" />
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
                  className="btn btn-outline btn-sm gap-2 opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
              </div>

              <Questionnaires
                loading={loadingQuestionnaires}
                error={errorQuestionnaires}
                questionnaires={questionnaires}
                role={role}
                onQuestionnairesChange={fetchQuestionnaires}
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
                  className="btn btn-outline btn-sm gap-2 opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
              </div>

              <Analysis
                loading={loadingAnalysis}
                error={errorAnalysis}
                analysis={visibleAnalysis}
                role={role}
              />
            </div>
          )}

          {/* ------------------ VISTA GESTOR DE CUESTIONARIOS (RUTA /a/questionnaire/:id) --------------------- */}
          {view === "questions" && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  navigate("/a/questionnaires");
                  setView("questionnaires");
                }}
                className="btn btn-outline btn-sm gap-2 opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
              <Questions questionnaireId={Number(id)} />
            </div>
          )}

          {/* ------------------ VISTA GESTOR DE ANÁLISIS (RUTA /a/analysis/:id) --------------------- */}
          {view === "analysisReview" && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  navigate("/a/analysis");
                  setView("analysis");
                }}
                className="btn btn-outline btn-sm gap-2 opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
              <AnalysisReview
                analysisId={Number(id)}
                onAnalysisUpdated={(updated) => {
                  setAnalysis((prev) =>
                    prev.map((a) => (a.analysisId === updated.analysisId ? updated : a))
                  );
                }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AdviserDashboard;
