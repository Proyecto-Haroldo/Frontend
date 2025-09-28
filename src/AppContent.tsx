import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Layout/Navbar';
import Home from './pages/client/Home';
import Services from './pages/client/Services';
import Schedule from './pages/client/Schedule';
import Diagnostics from './pages/client/Diagnostics';
import Account from './pages/client/Account';
import Questionnaire from './pages/client/Questionnaire';
import DiagnosticReview from './pages/client/DiagnosticReview';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import { useAuth } from './context/AuthContext';

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
                    <Route path="diagnostics" element={<Diagnostics />} />
                    <Route path="account" element={<Account />} />
                    <Route path="questionnaire" element={<Questionnaire />} />
                    <Route path="diagnostic-review" element={<DiagnosticReview />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

// ProtectedRoute to check auth & roles
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: number[] }) {
    const { token, role } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role!)) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

function AppContent() {
    const [isFirstMount, setIsFirstMount] = useState(true);
    const { role } = useAuth();

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
                                <Route path="" element={<h1>Admin Dashboard</h1>} />
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
                                    <Route path="diagnostics" element={<Diagnostics />} />
                                    <Route path="account" element={<Account />} />
                                    <Route path="questionnaire" element={<Questionnaire />} />
                                    <Route path="diagnostic-review" element={<DiagnosticReview />} />
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
                                <Route path="" element={<h1>Adviser Dashboard</h1>} />
                            </Routes>
                        </main>
                    </div>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default AppContent;
