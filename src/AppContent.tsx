import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './shared/context/AuthContext';
import Navbar from './shared/ui/layout/Navbar';
import Home from './pages/client/Home';
import Services from './pages/client/Services';
import Schedule from './pages/client/Schedule';
import Analysis from './pages/client/Analysis';
import Account from './pages/client/Account';
import Questionnaire from './pages/client/Questionnaire';
import AnalysisReview from './pages/client/AnalysisReview';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import AdviserDashboard from './pages/adviser/AdviserDashboard';
import AdviserProfile from './pages/adviser/AdviserProfile';

// AnimatedRoutes component wraps the nested Routes with AnimatePresence
function AnimatedRoutes() {
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
                    <Route path="analysis" element={<Analysis />} />
                    <Route path="account" element={<Account />} />
                    <Route path="questionnaire" element={<Questionnaire />} />
                    <Route path="analysis-review" element={<AnalysisReview />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

// ProtectedRoute to check auth & roles
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: number[] }) {
    const { token, role } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        return <Navigate to="/login" replace />;
    }
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
        document.title = `Finanzas${roleText ? " · " + roleText : ""}`;
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Moderator area (Administrador) */}
            <Route path="/m/*" element={
                <ProtectedRoute allowedRoles={[1]}>
                    <div className="min-h-screen bg-base-200 flex flex-col md:flex-row font-geist">
                        <Navbar />
                        <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                            <Routes>
                                <Route path="" element={<AdminDashboard />} />
                                <Route path="profile" element={<AdminProfile />} />
                            </Routes>
                        </main>
                    </div>
                </ProtectedRoute>
            } />

            {/* Client area (Clientes) */}
            <Route path="/c/*" element={
                <ProtectedRoute allowedRoles={[2]}>
                    <div className="min-h-screen bg-base-200 flex flex-col md:flex-row font-geist">
                        <Navbar />
                        <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                            {isFirstMount ? (
                                <Routes>
                                    <Route path="" element={<Home />} />
                                    <Route path="services" element={<Services />} />
                                    <Route path="schedule" element={<Schedule />} />
                                    <Route path="analysis" element={<Analysis />} />
                                    <Route path="account" element={<Account />} />
                                    <Route path="questionnaire" element={<Questionnaire />} />
                                    <Route path="analysis-review" element={<AnalysisReview />} />
                                </Routes>
                            ) : (
                                <AnimatedRoutes />
                            )}
                        </main>
                    </div>
                </ProtectedRoute>
            } />

            {/* Adviser area (Asesores) */}
            <Route path="/a/*" element={
                <ProtectedRoute allowedRoles={[3]}>
                    <div className="min-h-screen bg-base-200 flex flex-col md:flex-row font-geist">
                        <Navbar />
                        <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
                            <Routes>
                                <Route path="" element={<AdviserDashboard />} />
                                <Route path="profile" element={<AdviserProfile />} />
                            </Routes>
                        </main>
                    </div>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default AppContent;
