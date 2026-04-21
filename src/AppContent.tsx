import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './shared/context/AuthContext';
import Navbar from './shared/ui/layout/navigation/Navbar';
import Home from './pages/client/Home';
import Services from './pages/client/Services';
import Schedule from './pages/client/Schedule';
import Analysis from './pages/client/Analysis';
import Profile from './pages/client/Profile';
import Questionnaire from './pages/client/Questionnaire';
import AnalysisReview from './pages/client/AnalysisReview';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminReports from './pages/admin/Reports';
import AdviserDashboard from './pages/adviser/Dashboard';
import AdviserProfile from './pages/adviser/Profile';
import AdviserReports from './pages/adviser/Reports';
import QuestionnaireResults from './pages/client/QuestionnaireResults';
import { isTokenExpired } from './shared/utils/checkTokenExpiration';

// AnimatedRoutes component wraps the nested Routes with AnimatePresence
function AnimatedRoutes({ role }: { role: number | null }) {
    const location = useLocation();
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { type: "spring" as const, stiffness: 260, damping: 20, when: "beforeChildren" }
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

    if (role === 1) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    className="w-full"
                >
                    {/* Ojo: rutas relativas, no empiezan con / */}
                    <Routes location={location}>
                        <Route path="" element={<AdminDashboard view="selector" />} />
                        <Route path="users" element={<AdminDashboard view="users" />} />
                        <Route path="questionnaires" element={<AdminDashboard view="questionnaires" />} />
                        <Route path="questionnaires/:id" element={<AdminDashboard view="questions" />} />
                        <Route path="analysis" element={<AdminDashboard view="analysis" />} />
                        <Route path="analysis/:id" element={<AdminDashboard view="analysisReview" />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="profile" element={<AdminProfile />} />
                    </Routes>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (role === 2) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    className="w-full"
                >
                    {/* Ojo: rutas relativas, no empiezan con / */}
                    <Routes location={location}>
                        <Route path="" element={<Home />} />
                        <Route path="services" element={<Services />} />
                        <Route path="schedule" element={<Schedule />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="analysis" element={<Analysis />} />
                        <Route path="analysis/review/:id" element={<AnalysisReview />} />
                        <Route path="questionnaire/:id" element={<Questionnaire />} />
                        <Route path="questionnaire/results/:id" element={<QuestionnaireResults />} />
                    </Routes>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (role === 3) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    className="w-full"
                >
                    {/* Ojo: rutas relativas, no empiezan con / */}
                    <Routes location={location}>
                        <Route path="" element={<AdviserDashboard view="selector" />} />
                        <Route path="questionnaires" element={<AdviserDashboard view="questionnaires" />} />
                        <Route path="questionnaires/:id" element={<AdviserDashboard view="questions" />} />
                        <Route path="analysis" element={<AdviserDashboard view="analysis" />} />
                        <Route path="analysis/:id" element={<AdviserDashboard view="analysisReview" />} />
                        <Route path="reports" element={<AdviserReports />} />
                        <Route path="profile" element={<AdviserProfile />} />
                    </Routes>
                </motion.div>
            </AnimatePresence>
        );
    }
}

// ProtectedRoute and PublicRoute to check auth & roles
function ProtectedRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles?: number[];
}) {
    const { token, role } = useAuth();
    const navigate = useNavigate();

    const expired = isTokenExpired(token);

    useEffect(() => {
        if (!token || expired) {
            navigate('/login', { replace: true });
            return;
        }

        if (allowedRoles && (!role || !allowedRoles.includes(role))) {
            navigate('/login', { replace: true });
        }
    }, [token, role, allowedRoles, expired, navigate]);

    const isUnauthorized =
        !token || (allowedRoles && (!role || !allowedRoles.includes(role)));

    if (isUnauthorized) return null;

    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { token, role } = useAuth();
    const navigate = useNavigate();

    const expired = isTokenExpired(token);

    useEffect(() => {
        if (token && !expired) {
            if (role === 1) navigate('/m', { replace: true });
            else if (role === 2) navigate('/c', { replace: true });
            else if (role === 3) navigate('/a', { replace: true });
        }
    }, [token, role, expired, navigate]);

    const isAuthenticated = !!token;

    if (isAuthenticated) return null;

    return <>{children}</>;
}

function AppContent() {
    const [isFirstMount, setIsFirstMount] = useState(true);
    const { role, token } = useAuth();

    useEffect(() => {
        setIsFirstMount(false);

        // Define extensión del título
        let roleText = "";
        if (role === 1) roleText = "Admin";
        if (role === 2) roleText = "Clientes";
        if (role === 3) roleText = "Asesores";

        // Actualiza el título
        document.title = `Haroldo Finanzas${roleText ? " · " + roleText : ""}`;
    }, [role]);

    return (
        <Routes>
            {/* Root route - redirect based on authentication */}
            <Route path="/" element={
                token ? (
                    role === 1 ? <Navigate to="/m" replace /> :
                        role === 2 ? <Navigate to="/c" replace /> :
                            role === 3 ? <Navigate to="/a" replace /> :
                                <Navigate to="/login" replace />
                ) : (
                    <Navigate to="/login" replace />
                )
            } />

            {/* Public routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            <Route path="/signup" element={
                <PublicRoute>
                    <SignUp />
                </PublicRoute>
            } />

            {/* Moderator area (Administrador) */}
            <Route path="/m/*" element={
                <ProtectedRoute allowedRoles={[1]}>
                    <div className="min-h-dvh bg-base-200 flex flex-col md:flex-row font-family">
                        <Navbar />
                        <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                            {isFirstMount ? (
                                <Routes>
                                    <Route path="" element={<AdminDashboard view="selector" />} />
                                    <Route path="users" element={<AdminDashboard view="users" />} />
                                    <Route path="questionnaires" element={<AdminDashboard view="questionnaires" />} />
                                    <Route path="questionnaires/:id" element={<AdminDashboard view="questions" />} />
                                    <Route path="analysis" element={<AdminDashboard view="analysis" />} />
                                    <Route path="analysis/:id" element={<AdminDashboard view="analysisReview" />} />
                                    <Route path="reports" element={<AdminReports />} />
                                    <Route path="profile" element={<AdminProfile />} />
                                </Routes>
                            ) : (
                                <AnimatedRoutes role={role} />
                            )}
                        </main>
                    </div>
                </ProtectedRoute>
            } />

            {/* Client area (Clientes) */}
            <Route path="/c/*" element={
                <ProtectedRoute allowedRoles={[2]}>
                    <div className="min-h-dvh bg-base-200 flex flex-col md:flex-row font-family">
                        <Navbar />
                        <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                            {isFirstMount ? (
                                <Routes>
                                    <Route path="" element={<Home />} />
                                    <Route path="services" element={<Services />} />
                                    <Route path="schedule" element={<Schedule />} />
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="analysis" element={<Analysis />} />
                                    <Route path="analysis/review/:id" element={<AnalysisReview />} />
                                    <Route path="questionnaire/:id" element={<Questionnaire />} />
                                    <Route path="questionnaire/results/:id" element={<QuestionnaireResults />} />
                                </Routes>
                            ) : (
                                <AnimatedRoutes role={role} />
                            )}
                        </main>
                    </div>
                </ProtectedRoute>
            } />

            {/* Adviser area (Asesores) */}
            <Route
                path="/a/*"
                element={
                    <ProtectedRoute allowedRoles={[3]}>
                        <div className="min-h-dvh bg-base-200 flex flex-col md:flex-row font-family">
                            <Navbar />
                            <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                                {isFirstMount ? (
                                    <Routes>
                                        <Route path="" element={<AdviserDashboard view="selector" />} />
                                        <Route path="questionnaires" element={<AdviserDashboard view="questionnaires" />} />
                                        <Route path="questionnaires/:id" element={<AdviserDashboard view="questions" />} />
                                        <Route path="analysis" element={<AdviserDashboard view="analysis" />} />
                                        <Route path="analysis/:id" element={<AdviserDashboard view="analysisReview" />} />
                                        <Route path="reports" element={<AdviserReports />} />
                                        <Route path="profile" element={<AdviserProfile />} />
                                    </Routes>
                                ) : (
                                    <AnimatedRoutes role={role} />
                                )}
                            </main>
                        </div>
                    </ProtectedRoute>
                }
            />

            {/* FALLBACK ROUTE */}
            <Route path="*" element={
                token ? (
                    role === 1 ? <Navigate to="/m" replace /> :
                        role === 2 ? <Navigate to="/c" replace /> :
                            role === 3 ? <Navigate to="/a" replace /> :
                                <Navigate to="/login" replace />
                ) : (
                    <Navigate to="/login" replace />
                )
            } />
        </Routes>
    );
}

export default AppContent;
